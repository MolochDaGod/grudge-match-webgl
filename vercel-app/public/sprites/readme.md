# Sprite Assets

This directory contains sprite assets for the Grudge Tower 4D Character Builder.

## Structure

- `/characters/` - Character base sprites and animations
- `/accessories/` - Equipment, weapons, armor overlays  
- `/enemies/` - Enemy unit sprites for tower defense
- `/towers/` - Tower sprites converted from characters
- `/effects/` - Visual effects, auras, particles

## Character Sprite System

The character renderer generates sprites procedurally based on:

1. **Base Body Type**: Athletic, Bulky, Ethereal
2. **Color Scheme**: Primary, Secondary, Accent colors
3. **4D Attributes**: Affecting visual effects and proportions
4. **Equipment**: Overlay sprites for weapons/armor
5. **Dimensional Effects**: Auras, trails, distortion effects

## Usage

Characters are rendered using the `SpriteRenderer` component which:
- Draws layered 2D sprites on HTML5 Canvas
- Applies real-time animations and effects
- Reflects 4D attributes in visual appearance
- Supports export as tower sprites for gameplay

## Future Integration

When Unity PNG assets are available:
1. Place character sprite sheets in `/characters/`
2. Update `SpriteRenderer` to load actual PNG files
3. Configure sprite mapping for different attribute combinations
4. Add equipment overlay system for accessories