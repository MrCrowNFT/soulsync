# soulsync

Node js + express backend, react with ts frontend, this is because some ai tools are not yet well adapted to ts

## TODO

- debuging -> 
- styling -> implement the style guide
- Testing -> jest testing

## style guide

### Color Palette
#### Light Mode

Primary Color: #5B8BF6 (A soft blue - conveys trust, calm, and reliability)
Secondary Color: #7C64E6 (A gentle purple - represents creativity and emotional intelligence)
Accent Color: #3ECBC2 (A refreshing teal - symbolizes growth and healing)
Background: #F8F9FC (Off-white - clean but not harsh)
Surface/Card: #FFFFFF (White)
Text - Primary: #2D3748 (Dark slate - easy to read but softer than black)
Text - Secondary: #718096 (Medium gray - for less important text)
Success: #48BB78 (Green - for positive feedback)
Warning: #ED8936 (Orange - for cautions)
Error: #E53E3E (Red - for errors, but a softer shade)

#### Dark Mode

Primary Color: #6B95FB (Slightly lighter blue than light mode)
Secondary Color: #8E7AEA (Adjusted purple for dark backgrounds)
Accent Color: #4EDBD2 (Brighter teal for contrast)
Background: #1A202C (Deep blue-gray - less harsh than pure black)
Surface/Card: #2D3748 (Slightly lighter than background)
Text - Primary: #F7FAFC (Off-white - easy on the eyes)
Text - Secondary: #A0AEC0 (Light gray)
Success: #68D391 (Brighter green for dark mode visibility)
Warning: #F6AD55 (Lighter orange)
Error: #FC8181 (Softer red)

### Typography
#### Font Choices

Primary Font: "Outfit" - A modern, rounded sans-serif that's highly readable but has personality
Secondary Font: "Inter" - Clean and versatile for UI elements

#### Font Sizes

Heading 1: 28px (Bold, line height 1.2)
Heading 2: 24px (Bold, line height 1.2)
Heading 3: 20px (Semibold, line height 1.3)
Heading 4: 18px (Semibold, line height 1.3)
Body Text: 16px (Regular, line height 1.5)
Small/Caption: 14px (Regular, line height 1.4)
Micro: 12px (Medium, line height 1.3)

### UI Elements
#### Buttons

Primary: Filled with primary color, 8px border radius
Secondary: Outlined with 1.5px border, 8px border radius
Text Button: No background, just text in primary color
All buttons should have a subtle hover effect (slight darkening or scaling)

#### Cards & Containers

12px border radius for cards
Subtle shadow: 0 4px 6px rgba(0, 0, 0, 0.05)
16px padding inside cards
20px spacing between major elements

#### Input Fields

8px border radius
1px border in light gray (#E2E8F0 in light mode, #4A5568 in dark mode)
Focus state: 2px border in primary color
Clear visual distinction for active states

#### Iconography

Rounded, friendly icon style (Similar to Phosphor Icons or Feather Icons)
Icons should be 24px for navigation and 18px for inline
Use icons sparingly to avoid overwhelming users

Accessibility Considerations

Ensure all text has sufficient contrast (WCAG AA standard minimum)
Include focus indicators for keyboard navigation
Design hover and active states for all interactive elements

Visual Language

Tone: Warm and supportive
Shapes: Rounded corners and soft edges
Imagery: If using illustrations, opt for diverse, inclusive human figures with soft, friendly styling
Animation: Subtle, smooth transitions (300-400ms duration) to create a sense of calm
Spacing: Generous whitespace to avoid cluttered feelings

Special Components
Chat Interface

Message bubbles with 12px border radius
User messages in primary color, AI responses in secondary color
Timestamps in small, light gray text
Clear visual distinction between user and AI

Mood Tracker

Use color gradients to represent mood range (cool colors for lower moods, warm colors for higher)
Simple, intuitive emoji or icon representations for different moods
Progress visualization with smooth animations

Dashboard

Clean, minimal charts and graphs
Information cards with clear hierarchy
Focus on data visualization that's easy to understand

