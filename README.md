Transformations
===============

jQuery plugin to evaulate dimensions of an html element after css3 transformations

PROBLEM

CSS transforms allows elements styled with CSS to be transformed in two-dimensional or three-dimensional space.
Sometimes, after applying these transformations, is usefull to know the new size of a transformed element.

MY SOLUTION

A jQuery plugin which execute the same calculations as the browser and returns actual size of an element.

USAGE
- $('#element').transform().transformedRectangle() 
  returns an object with the following properties: left, top width, height, spin (this last one is specifies if the back side of the element is visible)
- $('#element').transform().transformedWidth
- $('#element').transform().transformedHeight
