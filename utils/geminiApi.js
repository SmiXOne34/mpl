const axios = require('axios');
const fs = require('fs');

/**
 * Utility for interacting with Google's Gemini API
 */
// Updated API key and URL for Gemini API with the gemini-2.0-flash model
const GEMINI_API_KEY = 'AIzaSyATl5i_9Hqe1gPsZs5L2L-riqQ2QVTSX5w';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_VISION_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';

/**
 * Generate content using Gemini API
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<Object>} - The response from Gemini
 */
// Mock response for testing or when API is unavailable
const getMockResponse = (prompt) => {
  console.log('Using mock Gemini API response');
  
  // Extract cuisine and meal type from prompt if possible
  let cuisine = 'Italian';
  let mealType = 'dinner';
  
  const cuisineMatch = prompt.match(/detailed\s+(\w+)\s+/i);
  if (cuisineMatch && cuisineMatch[1]) {
    cuisine = cuisineMatch[1];
  }
  
  const mealTypeMatch = prompt.match(/(\w+)\s+recipe/i);
  if (mealTypeMatch && mealTypeMatch[1]) {
    mealType = mealTypeMatch[1];
  }
  
  // Create a mock response based on the prompt
  return {
    candidates: [
      {
        content: {
          parts: [
            {
              text: `{
  "name": "${cuisine} ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Special",
  "description": "A delicious ${cuisine} ${mealType} that's perfect for any occasion. This dish combines traditional flavors with modern techniques for a memorable meal.",
  "ingredients": [
    {"name": "Main ingredient", "quantity": "2", "unit": "cups"},
    {"name": "Secondary ingredient", "quantity": "1", "unit": "cup"},
    {"name": "Seasoning", "quantity": "2", "unit": "tablespoons"},
    {"name": "Herbs", "quantity": "1", "unit": "tablespoon"},
    {"name": "Oil", "quantity": "3", "unit": "tablespoons"}
  ],
  "preparationSteps": [
    "Step 1: Prepare all ingredients by washing and chopping as needed.",
    "Step 2: Heat oil in a large pan over medium heat.",
    "Step 3: Add main ingredients and cook for 5-7 minutes.",
    "Step 4: Add secondary ingredients and seasonings.",
    "Step 5: Cook for an additional 10 minutes until done.",
    "Step 6: Garnish with herbs and serve hot."
  ],
  "tags": ["${cuisine}", "${mealType}", "Easy", "Quick"]
}`
            }
          ]
        }
      }
    ]
  };
};

const generateContent = async (prompt) => {
  try {
    console.log('Sending request to Gemini API...');
    
    // Simplified request format based on the provided example
    const requestData = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };
    
    console.log('Request data:', JSON.stringify(requestData, null, 2));
    
    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );
  
      console.log('Gemini API response status:', response.status);
      
      if (!response.data) {
        throw new Error('Empty response from Gemini API');
      }
      
      return response.data;
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError);
      
      // Provide more detailed error information
      let errorMessage = `Failed to get response from Gemini API: ${apiError.message}`;
      
      if (apiError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('API Response Error Data:', apiError.response.data);
        console.error('API Response Status:', apiError.response.status);
        console.error('API Response Headers:', apiError.response.headers);
        
        errorMessage = `Gemini API Error (${apiError.response.status}): ${
          apiError.response.data?.error?.message || 
          apiError.response.data?.message || 
          apiError.message
        }`;
      } else if (apiError.request) {
        // The request was made but no response was received
        console.error('API Request Error:', apiError.request);
        errorMessage = 'No response received from Gemini API. Please check your network connection.';
      }
      
      // Throw the error with detailed information
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error in generateContent:', error);
    // Throw the error instead of providing a fallback
    throw error;
  }
};

/**
 * Generate a meal recipe using Gemini API
 * @param {string} prompt - The prompt describing the meal to generate
 * @returns {Promise<Object>} - The generated meal data
 */
const generateMealRecipe = async (prompt) => {
  try {
    console.log('Generating meal recipe with prompt:', prompt);
    
    // Extract cuisine and meal type for better image generation
    let cuisine = '';
    let mealType = '';
    
    const cuisineMatch = prompt.match(/detailed\s+(\w+)\s+/i);
    if (cuisineMatch && cuisineMatch[1]) {
      cuisine = cuisineMatch[1];
    }
    
    const mealTypeMatch = prompt.match(/(\w+)\s+recipe/i);
    if (mealTypeMatch && mealTypeMatch[1]) {
      mealType = mealTypeMatch[1];
    }
    
    // Create a structured prompt for the Gemini API
    const structuredPrompt = `
You are a professional chef and recipe creator. Generate a detailed recipe based on the following requirements: ${prompt}

Your response must be a valid JSON object with this exact structure:
{
  "name": "Recipe Name",
  "description": "A brief description of the dish (max 500 characters)",
  "ingredients": [
    {"name": "Ingredient 1", "quantity": "1", "unit": "cup"},
    {"name": "Ingredient 2", "quantity": "2", "unit": "tablespoons"}
  ],
  "preparationSteps": [
    "Step 1: Do this first",
    "Step 2: Then do this"
  ],
  "tags": ["Tag1", "Tag2", "Tag3"]
}

Important: Return ONLY the JSON object with no additional text, markdown formatting, or explanations.
`;

    console.log('Sending structured prompt to Gemini API');
    const response = await generateContent(structuredPrompt);
    console.log('Received response from Gemini API:', JSON.stringify(response, null, 2));
    
    if (!response.candidates || response.candidates.length === 0) {
      console.error('No candidates in Gemini response:', response);
      throw new Error('No candidates in Gemini response');
    }
    
    // Extract the text from the response
    const textContent = response.candidates[0].content.parts[0].text;
    console.log('Extracted text content:', textContent);
    
    // Find the JSON object in the response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error('Could not extract JSON from Gemini response:', textContent);
      throw new Error('Could not extract JSON from Gemini response');
    }
    
    console.log('Extracted JSON:', jsonMatch[0]);
    
    try {
      // Parse the JSON
      const mealData = JSON.parse(jsonMatch[0]);
      
      // Validate the meal data
      if (!mealData.name || !mealData.description || !Array.isArray(mealData.ingredients) || !Array.isArray(mealData.preparationSteps)) {
        console.error('Invalid meal data structure:', mealData);
        throw new Error('Invalid meal data structure');
      }
      
      // Add a placeholder image URL using extracted cuisine and meal type if available
      const imageTerms = [];
      if (cuisine) imageTerms.push(cuisine.toLowerCase());
      if (mealType) imageTerms.push(mealType.toLowerCase());
      
      // Add the meal name as well, but limit to first two words to avoid overly long URLs
      const nameWords = mealData.name.toLowerCase().split(/\s+/).slice(0, 2);
      const nameTerms = nameWords.join(',');
      
      // Combine all terms for a better image search, but keep it simple
      const searchTerms = ['food'];
      if (cuisine) searchTerms.push(cuisine.toLowerCase());
      if (mealType) searchTerms.push(mealType.toLowerCase());
      
      // Create a clean URL-safe search string
      const cleanSearchTerms = searchTerms.join(',');
      
      mealData.imageUrl = `https://source.unsplash.com/random/300x200/?${encodeURIComponent(cleanSearchTerms)}`;
      
      console.log('Successfully generated meal recipe:', mealData);
      return mealData;
    } catch (parseError) {
      console.error('Error parsing JSON from Gemini response:', parseError);
      console.error('Raw text content that failed to parse:', textContent);
      
      // Try to clean up the JSON string and parse again
      try {
        // Remove any markdown code block markers
        const cleanedText = textContent.replace(/```json|```/g, '').trim();
        console.log('Attempting to parse cleaned text:', cleanedText);
        
        const mealData = JSON.parse(cleanedText);
        
        // Validate the meal data
        if (!mealData.name || !mealData.description || !Array.isArray(mealData.ingredients) || !Array.isArray(mealData.preparationSteps)) {
          console.error('Invalid meal data structure after cleanup:', mealData);
          throw new Error('Invalid meal data structure after cleanup');
        }
        
        // Add a placeholder image URL
        mealData.imageUrl = `https://source.unsplash.com/random/300x200/?food,${mealData.name.toLowerCase().replace(/\s+/g, ',')}`;
        
        console.log('Successfully parsed meal recipe after cleanup:', mealData);
        return mealData;
      } catch (secondParseError) {
        console.error('Second attempt at parsing also failed:', secondParseError);
        throw new Error(`Error parsing JSON from Gemini response: ${parseError.message}`);
      }
    }
  } catch (error) {
    console.error('Error generating meal recipe:', error);
    // Throw the error instead of providing a fallback
    throw error;
  }
};

/**
 * Analyze an image to detect ingredients using Gemini Vision API
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string[]>} - Array of detected ingredients
 */
const analyzeImage = async (imagePath) => {
  try {
    console.log('Analyzing image to detect ingredients...');
    
    // Read the image file and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Create the request data for Gemini Vision API
    const requestData = {
      contents: [
        {
          parts: [
            {
              text: "Identify all food ingredients visible in this image. Return ONLY a JSON array of ingredient names, with no additional text or explanation. For example: [\"tomato\", \"onion\", \"chicken\", \"olive oil\"]"
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ]
    };
    
    // Make the API request
    const response = await axios.post(
      `${GEMINI_VISION_URL}?key=${GEMINI_API_KEY}`,
      requestData
    );
    
    // Extract the text response
    const textResponse = response.data.candidates[0].content.parts[0].text;
    
    // Parse the JSON array from the response
    try {
      // Try to parse the response as JSON
      const ingredients = JSON.parse(textResponse);
      
      // Validate that it's an array
      if (Array.isArray(ingredients)) {
        return ingredients;
      } else {
        console.error('Response is not an array:', textResponse);
        // Try to extract an array if the response contains one
        const match = textResponse.match(/\\[.*\\]/);
        if (match) {
          return JSON.parse(match[0]);
        }
        // Fall back to a simple array with the text
        return [textResponse];
      }
    } catch (parseError) {
      console.error('Error parsing ingredients JSON:', parseError);
      // If parsing fails, try to extract ingredient names using regex
      const ingredientMatches = textResponse.match(/["']([^"']+)["']/g);
      if (ingredientMatches) {
        return ingredientMatches.map(match => match.replace(/["']/g, ''));
      }
      // Fall back to splitting by commas or newlines
      return textResponse
        .split(/[,\\n]/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
    
  } catch (error) {
    console.error('Error in analyzeImage:', error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
};

/**
 * Generate a recipe based on available ingredients
 * @param {string[]} ingredients - Array of available ingredients
 * @returns {Promise<Object>} - Recipe object
 */
const generateMealFromIngredients = async (ingredients) => {
  try {
    console.log('Generating recipes from ingredients:', ingredients);
    
    // Create a structured prompt for the Gemini API
    const prompt = `
Generate a detailed recipe using these ingredients: ${ingredients.join(', ')}

Your response must be a valid JSON object with this exact structure:
{
  "name": "Recipe Name",
  "description": "A brief description of the dish (max 200 characters)",
  "ingredients": [
    "Ingredient 1",
    "Ingredient 2"
  ],
  "instructions": [
    "Step 1: Do this first",
    "Step 2: Then do this"
  ],
  "tips": "Optional cooking tips and suggestions",
  "tags": ["Tag1", "Tag2", "Tag3"]
}

Important: Return ONLY the JSON object with no additional text, markdown formatting, or explanations.
Only use ingredients from the provided list.
`;
    
    // Generate content using the Gemini API
    const response = await generateContent(prompt);
    
    // Extract the text response
    const textResponse = response.candidates[0].content.parts[0].text;
    
    // Parse the JSON object from the response
    try {
      // Find the JSON object in the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.error('Could not extract JSON from Gemini response:', textResponse);
        throw new Error('Could not extract JSON from Gemini response');
      }
      
      // Parse the JSON
      const recipe = JSON.parse(jsonMatch[0]);
      
      // Validate the recipe data
      if (!recipe.name || !recipe.description || !Array.isArray(recipe.ingredients) || !Array.isArray(recipe.instructions)) {
        console.error('Invalid recipe data structure:', recipe);
        throw new Error('Invalid recipe data structure');
      }
      
      return recipe;
    } catch (parseError) {
      console.error('Error parsing recipe JSON:', parseError);
      
      // Try to clean up the JSON string and parse again
      try {
        // Remove any markdown code block markers
        const cleanedText = textResponse.replace(/```json|```/g, '').trim();
        console.log('Attempting to parse cleaned text:', cleanedText);
        
        const recipe = JSON.parse(cleanedText);
        return recipe;
      } catch (secondParseError) {
        console.error('Second attempt at parsing also failed:', secondParseError);
        throw new Error('Failed to parse recipe data from AI response');
      }
    }
    
  } catch (error) {
    console.error('Error in generateMealFromIngredients:', error);
    throw new Error(`Failed to generate recipes: ${error.message}`);
  }
};

module.exports = {
  generateContent,
  generateMealRecipe,
  analyzeImage,
  generateMealFromIngredients
};