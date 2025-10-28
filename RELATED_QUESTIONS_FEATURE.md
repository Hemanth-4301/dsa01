# Related Questions Recommendation Feature

## Overview

Added a smart recommendation system that suggests related questions to users after they view/learn a question. The recommendations are based on shared tags and categories, helping users discover similar problems to practice.

## Changes Made

### 1. Backend API Endpoint (`server/routes/questions.js`)

- **New Route**: `GET /api/questions/:id/related`
- **Algorithm**:
  - Finds questions that share tags or belong to the same category
  - Calculates a relevance score for each question:
    - +3 points per matching tag
    - +2 points for same category
    - +1 point for same difficulty level
  - Returns top 5 most relevant questions sorted by score
  - Excludes the current question from results

### 2. Frontend Component (`frontend/src/components/RelatedQuestions.jsx`)

- **New Component**: `RelatedQuestions`
- **Features**:
  - Beautiful gradient header with "Related Questions You Might Like"
  - Displays each related question with:
    - Problem title (clickable link)
    - Matching tags highlighted in blue
    - Difficulty badge with color coding
    - Category badge
    - Relevance indicator ("Highly Relevant" or "Relevant")
  - Hover effects with smooth animations
  - "Explore More Questions" button at the bottom
  - Fully responsive design for mobile and desktop
  - Dark mode support

### 3. Question Detail Page (`frontend/src/pages/QuestionDetail.jsx`)

- **Integration**:
  - Added query to fetch related questions using React Query
  - Displays related questions section below the main content
  - Only shows when related questions are available
  - Includes loading state handling

## How It Works

1. **User Views a Question**: When a user opens a question detail page
2. **Fetch Related Questions**: The frontend automatically fetches related questions based on the current question's tags and category
3. **Display Recommendations**: Shows up to 5 most relevant questions below the main content
4. **Smart Ranking**: Questions are ranked by:
   - Number of shared tags (most important)
   - Same category (important)
   - Same difficulty (slight preference)
5. **Easy Navigation**: Users can click on any related question to navigate directly to it

## User Benefits

- **Continuous Learning**: Helps users discover similar problems to practice
- **Better Retention**: Reinforces concepts by suggesting related problems
- **Efficient Navigation**: No need to go back to the questions list
- **Smart Recommendations**: Uses tags and categories for relevant suggestions
- **Visual Clarity**: Shows which tags match, making it clear why a question is suggested

## Technical Features

- Uses React Query for efficient data fetching and caching
- Implements MongoDB aggregation for fast query performance
- Responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Dark mode compatible
- Error handling and loading states
- Optimistic UI updates

## Example Use Case

A user is learning about "Two Sum" problem with tags `["array", "hash-table"]` and category `"arrays"`. The recommendation system will show:

1. Other problems with `"array"` and `"hash-table"` tags (highest priority)
2. Problems from the `"arrays"` category
3. Sorted by the number of matching tags and other factors
4. Visual indicators showing which tags match

This helps the user practice similar concepts and build stronger problem-solving skills!
