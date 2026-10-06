partition

store in child
- knows it's width for styling
- when resizing, it must find it's sibling and resize that

store in parent
- child must ask parent for width (easy)
- when resizing, parent owns divider, adjusts children accordingly


Ok I'm happier now. Still need - obj holds it's childrensplitdirection
Splits are registered by parent, who decides the victim and hands logic over to it?
If a split is perpendicular to that node's direction, it hands it down to the child the split is in (perpendicular splits are always in a single child)
