import FlowOptionModel from '../models/FlowOption';
import EmbeddingService from './EmbeddingService';
import { FlowOption } from '../interfaces/FlowOption';
import { Types } from 'mongoose';

class FlowService {
  // Find the most similar flow options based on a user message
  async findSimilarOptions(userMessage: string, limit: number = 5): Promise<FlowOption[]> {
    try {
      console.time('findSimilarOptions');
      // Get all options from the database
      const allOptions = await FlowOptionModel.find();
      console.log(`Found ${allOptions.length} options in total`);

      if (!allOptions.length) {
        console.log('No options found in the database');
        return [];
      }

      // Generate embedding for user message
      const userMessageEmbedding = await EmbeddingService.generateEmbedding(
        EmbeddingService.normalizeText(userMessage)
      );

      // First filter out options with isMenu: false at the top level, as they are bot messages not user options
      const menuOptions = allOptions.filter(option => option.isMenu !== false);
      console.log(`After filtering isMenu=false, ${menuOptions.length} options remain`);

      // Calculate similarity for these filtered options only
      console.time('generateSimilarity');
      const optionsWithSimilarity = await Promise.all(
        menuOptions.map(async (option) => {
          // Generate embedding for each option
          const optionText = EmbeddingService.normalizeText(option.message);
          const optionEmbedding = await EmbeddingService.generateEmbedding(optionText);

          // Calculate similarity
          const similarity = EmbeddingService.calculateCosineSimilarity(
            userMessageEmbedding,
            optionEmbedding
          );

          const optionObj = option.toObject();

          return {
            ...optionObj,
            _id: optionObj._id instanceof Types.ObjectId
              ? optionObj._id.toString()
              : String(optionObj._id), // Convert to string safely
            similarity
          };
        })
      );
      console.timeEnd('generateSimilarity');

      // Get the top 50 most similar options - we'll only check parent chains for these
      const topOptions = optionsWithSimilarity
        .sort((a, b) => (b.similarity as number) - (a.similarity as number))
        .slice(0, 50);

      console.log(`Selected top ${topOptions.length} options by similarity for parent chain check`);

      // Now check parent chains only for these top options
      console.time('checkParentChains');
      const validOptions = [];
      for (const option of topOptions) {
        const hasNonMenuParent = await this.hasNonMenuParentInChain(option);
        if (!hasNonMenuParent) {
          // Only add flow paths for valid options that pass the parent check
          const flowPath = await this.buildFlowPath(option);
          validOptions.push({
            ...option,
            flowPath,
            originalMessage: option.message
          });
        }

        // If we already have enough valid options, break early
        if (validOptions.length >= limit) break;
      }
      console.timeEnd('checkParentChains');
      console.log(`After checking parent chains: ${validOptions.length} valid options from top results`);

      // Take the top results according to limit
      const finalOptions = validOptions.slice(0, Math.min(limit, 5));
      console.log(`Final options count: ${finalOptions.length}`);

      // If no valid options found after all our checks, suggest user rephrases
      if (finalOptions.length === 0) {
        console.log('No valid options found, returning "rephrase" message');

        // Create a special "rephrase" option
        // return [{
        //   _id: 'rephrase_' + Date.now(),
        //   message: "I'm not sure I understand your request. Could you please rephrase or provide more details about your IT issue?",
        //   isMenu: false, // This will be shown as a bot message, not a clickable option
        //   flowPath: '',
        //   originalMessage: "I'm not sure I understand your request. Could you please rephrase or provide more details about your IT issue?"
        // }];
        return [];
      }

      // Simply remove similarity from the sorted options and return them
      console.timeEnd('findSimilarOptions');
      return finalOptions.map(({ similarity, ...option }) => option as FlowOption);
    } catch (error) {
      console.error('Error finding similar options:', error);
      throw error;
    }
  }

  // Check if an option or any of its parents in the chain has isMenu: false
  private async hasNonMenuParentInChain(option: any): Promise<boolean> {
    try {
      // If this option itself has isMenu: false, return true immediately
      if (option.isMenu === false) {
        return true;
      }

      // If this is a root option (no parent), return false
      if (!option.parentId) {
        return false;
      }

      // Check if parentId is a valid MongoDB ObjectId
      const isValidObjectId = (id: string) => {
        return /^[0-9a-fA-F]{24}$/.test(id);
      };

      let currentOption = option;
      let maxDepth = 5; // Prevent infinite loops

      while (currentOption.parentId && maxDepth > 0) {
        // Skip invalid ObjectIds to prevent errors
        if (!isValidObjectId(currentOption.parentId)) {
          break;
        }

        try {
          const parentOption = await FlowOptionModel.findById(currentOption.parentId);
          if (!parentOption) break;

          // Handle both document and object formats
          const parentIsMenu = parentOption.isMenu !== undefined ?
                               parentOption.isMenu :
                               (parentOption.toObject ? parentOption.toObject().isMenu : undefined);

          // Check if this parent has isMenu: false
          if (parentIsMenu === false && parentOption.parentId !== "root") {
            console.log(`Found non-menu parent: ${parentOption._id} for option: ${option._id}`);
            console.log(`Parent's parentID is: ${parentOption.parentId}`);
            return true;
          }

          currentOption = parentOption;
        } catch (err) {
          console.error(`Error finding parent with ID ${currentOption.parentId}:`, err);
          break;
        }

        maxDepth--;
      }

      return false; // No parent with isMenu: false found
    } catch (error) {
      console.error('Error checking option parent chain:', error);
      return false; // Return false on error to be permissive
    }
  }

  // Get next flow options based on the selected option ID
  async getContinueFlow(optionId: string): Promise<FlowOption[]> {
    try {
      const childOptions = await FlowOptionModel.find({ parentId: optionId });
      console.log(`Found ${childOptions.length} child options for parent ${optionId}`);

      // Check if there's an instruction option (isMenu=false) among the children
      const instructionOption = childOptions.find(option => option.isMenu === false);

      // Convert Mongoose documents to plain objects and ensure _id is a string
      const results = await Promise.all(childOptions.map(async (doc) => {
        const obj = doc.toObject();

        // Add flow path to these options
        const flowPath = await this.buildFlowPath(doc);

        return {
          ...obj,
          _id: obj._id instanceof Types.ObjectId
            ? obj._id.toString()
            : String(obj._id),
          flowPath,
          originalMessage: obj.message,
          // Add a flag to identify if this is an instruction
          isInstruction: obj.isMenu === false
        } as FlowOption;
      }));

      // If we have an instruction option, return only that one to be shown as a message
      // This prevents instructions from appearing in the options list
      if (instructionOption) {
        const instructionResult = results.find(r => !r.isMenu);
        if (instructionResult) {
          return [instructionResult];
        }
      }

      return results;
    } catch (error) {
      console.error('Error getting continue flow:', error);
      throw error;
    }
  }

  // Get flow options by parentId
  async getFlowOptionsByParentId(parentId: string): Promise<FlowOption[]> {
    try {
      const options = await FlowOptionModel.find({ parentId });
      console.log(`Found ${options.length} options with parentId: ${parentId}`);

      // Convert Mongoose documents to plain objects and ensure _id is a string
      const results = await Promise.all(options.map(async (doc) => {
        const obj = doc.toObject();

        // Add flow path to these options if needed
        const flowPath = await this.buildFlowPath(doc);

        return {
          ...obj,
          _id: obj._id instanceof Types.ObjectId
            ? obj._id.toString()
            : String(obj._id),
          flowPath,
          originalMessage: obj.message
        } as FlowOption;
      }));

      return results;
    } catch (error) {
      console.error('Error getting flow options by parentId:', error);
      throw error;
    }
  }

  // Helper method to build a path showing the conversation flow context
  private async buildFlowPath(option: any): Promise<string | null> {
    try {
      // If this is a root option (no parent), return null
      if (!option.parentId) {
        return null;
      }

      // Check if parentId is a valid MongoDB ObjectId
      const isValidObjectId = (id: string) => {
        return /^[0-9a-fA-F]{24}$/.test(id);
      };

      let currentOption = option;
      const pathSegments: string[] = [];

      // Trace up the tree to build the path (limit to prevent infinite loop)
      let maxDepth = 5; // Adjust as needed to prevent too deep or infinite paths

      while (currentOption.parentId && maxDepth > 0) {
        // First add the current option's message
        // if (pathSegments.length === 0) {
        //   pathSegments.unshift(currentOption.message);
        // }

        // Skip invalid ObjectIds to prevent errors
        if (!isValidObjectId(currentOption.parentId)) {
          console.log(`Skipping invalid parentId: ${currentOption.parentId}`);
          break;
        }

        try {
          const parentOption = await FlowOptionModel.findById(currentOption.parentId);
          if (!parentOption) break;

          // Add parent message to beginning of path
          pathSegments.unshift(parentOption.message);
          currentOption = parentOption;
        } catch (err) {
          console.error(`Error finding parent with ID ${currentOption.parentId}:`, err);
          break; // Break the loop on error to avoid crashing
        }

        maxDepth--;
      }

      // remove the first intro message
      pathSegments.shift();

      // Return the flow path as a string if we have any segments
      return pathSegments.length > 0 ? pathSegments.join(' → ') : null;
    } catch (error) {
      console.error('Error building flow path:', error);
      return null; // Return null on error, so we don't break the main functionality
    }
  }
}

export default new FlowService();