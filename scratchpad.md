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


When an event happens
it propogates to first modulenode (which is therefore a leaf)
which stops it and asks : are we splitting along parent's axis or against it?
if we're splitting against parent's axis, we'll create two children for this node
if we're splitting with parent's axis, we'll create 1 child for the parent 

struggling with state and how to make things react to changes in the underlying object.

Looks like I'm gonna solve it with useSyncExternalStore hook
https://chatgpt.com/share/e/6ad066e3-f66c-83e8-96f7-da9dd5b2db99

actually no reducer and state

I think reducer is actually for whole tree