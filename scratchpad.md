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


Short version: isLast() and getIndex() depend on object identity and closures. Immutable state updates (mutative/useReducer) break both of those.

1. indexOf(node) compares references, and the copies aren't the same object

- indexOf uses ===. For objects that means "is this the exact same object in memory", not "does it look the same".
- Mutative is an immutable-update library. When you change a node in a draft, it doesn't modify the old object. It makes a new copy of that node and of every ancestor up to the root. Nodes you didn't touch keep their old identity (this is called structural sharing).
- The node inside isLast/getIndex is the closure variable from createModuleNodepoints at the original object that was created.

- Display() runs again on every render, and each run has its own const treeState.
- A method created during render N closes over render N's treeState and never sees later ones.
- The root is created on the first render, so its methods see the initial tree forever. Nodes created inside the reducer see whichever render's treeState was around when that reducer ran.
- When getNode(parent.id) runs against an old tree, the parent may not exist yet, or it may have outdated children.

3. ?? true never kicks in

a == b ?? true
- == binds tighter than ??, so this parses as (a == b) ?? true.
- == always returns a boolean, never null or undefined, so the fallback is dead code.
- When the lookup fails you get undefined - 1 == -1, which is NaN == -1, which is false.
- Similar issue in getIndex: indexOf returns -1 rather than undefined when nothing matches, so ?? 0 doesn't help there either.

4. How this shows up as the ordering weirdness

- In ModuleNode.jsx, the split call does index: obj.getIndex()+1. When getIndex returns -1, that gives index: 0.
- With index: 0, the reducer inserts at the front, and node.children[index - 1]defined.
- Result: children land in the wrong position, or the reducer throws.

5. Related things to know about (same root cause)

- parent refs: each child stores a reference to its parent object. After an updut child.parent still points to the old version. parent.isVertical in ModuleNode (used for willSplitItself) can read stale data. Only .id is safe through a reference like this, because ids never change.
- Circular structure: parent → children → parent is a cycle. Immutable-update libraries (Immer, mutative) generally assume state is a tree with no cycles.
- idTracker skips numbers: createTree(createModuleNode(...)) runs on every render. Its result is thrown away after the first one, but it still bumps idTracker each time. Ids stay unique, so this isn't the bug, just something worth knowing.

Concept to read up on

The general convention with immutable/React state: keep state as plain data, compare things by id rather than by object reference, and don't put methods that capture variables into state. The React docs cover this in "Updating Objects in State" and "Choosing the State Structure" (the "avoid duplication" and "avoid deeply nested state" sections, which describe storing idsinstead of references). How you restructure around that is your call.


Mostly right. You don't need to flatten. Ids for parent references are the usual approach, but the methods still have the same problem.

What mutative actually gives you

- It changes how you write updates. You can mutate a draft directly instead of hand-spreading nested objects like {...a, children: [...a.children.slice(0,i), ...]}.
- That hand-spreading is the main reason the React docs push flattening. Mutative and Immer remove it, so nested trees are a normal, accepted shape with these libraries.
- It does not change the result. Every update still produces new objects along the changed path, and old references still point at old versions.

What still breaks with nesting + mutative

- Object references kept across updates. parent is one, and so is the node captured by the closures in isLast/getIndex. Each one gets frozen at whatever version existed when it was created.
- Identity comparisons across versions, like indexOf(node) with an old node against new children.
- Within a single reducer call, identity is consistent. Reading draft.getNode(x) twice gives you the same draft object. The trouble only starts when something carries an object across renders or updates.

Parent as id

- Yes, that's the common convention: a node stores parentId instead of parent. t up in the current tree.
- It also removes the circular parent ↔ children structure, which these libraries prefer to avoid.

The catch: the methods

Switching to parentId alone won't fix isLast/getIndex. They still depend on:
- a captured node (an object reference)
- a captured treeState (a stale closure)

The general convention is that state holds plain data and logic lives outside inctions that take the current tree or node as arguments, rather than methods onstate objects that remember their surroundings. For example:

// identity-based: breaks across versions
children.indexOf(node)

// id-based: works on any version
children.findIndex(c => c.id === node.id)

Another option: a child's position is already known at render time, because children.map passes the index as its second argument. How you use that is up to you.