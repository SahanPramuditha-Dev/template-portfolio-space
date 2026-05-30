# Navbar Bugfix v2 - Fix Active Highlighting (Short Sections)

Status: Complete

## Issue

Testimonials click highlighted Contact because the Testimonials section was too short for the old fixed-offset detection.

## Plan

Replace `Navbar.jsx` fixed-offset detection with `IntersectionObserver`.

- Most visible section above 25% wins.
- Short sections are handled consistently.

## Steps

### 1. [x] Create TODO v2
### 2. [x] User confirmed bug and fix
### 3. [x] Navbar.jsx: IntersectionObserver implemented
### 4. [x] Update TODO
### 5. [x] Test all nav clicks stay highlighted correctly
### 6. [x] Complete

**Result**: Navbar syntax error fixed. IntersectionObserver active highlighting now works for all sections.
