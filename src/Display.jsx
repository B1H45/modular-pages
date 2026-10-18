import { useState, useEffect, useRef, useReducer } from "react";
import ModuleNode from "./ModuleNode";
import { Stage, Layer, Line } from "react-konva";
import "./styles/App.css";

function Display() {
    function createModuleNode(partition, level, parent, content, isVertical) {
        const node = {
            partition,
            parent,
            children: [],
            level,
            content,
            isVertical,
            isLast() {
                return (
                    node.parent?.children.indexOf(node) ==
                        node.parent?.children.length - 1 ?? true
                );
            },

            //gets index within it's parent's children list
            getIndex() {
                return node.parent?.children.indexOf(node);
            },
        };

        //     splitIt(childContent, partition, index) {
        //         let child;
        //         if (node.children.length > 0) {
        //             let prevsWidths = 0;
        //             for (let i = 0; i < index; i++) {
        //                 prevsWidths += node.children[i].partition;
        //             }
        //             const newNodePartition = Math.max(
        //                 node.children[index - 1].partition - partition,
        //                 0,
        //             );
        //             node.children[index - 1].partition = partition;
        //             child = createModuleNode(
        //                 newNodePartition,
        //                 node.level + 1,
        //                 node,
        //                 childContent,
        //             );
        //             node.children.splice(index, 0, child);
        //         } else {
        //             node.isVertical = node.parent ? !node.parent.isVertical : false;
        //             child = createModuleNode(
        //                 partition,
        //                 node.level + 1,
        //                 node,
        //                 node.content,
        //             );
        //             const child2 = createModuleNode(
        //                 100 - partition,
        //                 node.level + 1,
        //                 node,
        //                 childContent,
        //             );
        //             node.children.splice(0, 0, child);
        //             node.children.splice(1, 0, child2);
        //         }
        //         return child;
        //     },

        //     createChild(content, partition, index) {
        //         let child = createModuleNode(
        //             partition,
        //             node.level + 1,
        //             node,
        //             content,
        //         );
        //         node.children.splice(index, 0, child);
        //         // setRoot(rootNode);
        //         return child;
        //     },
        // };
        return node;
    }

    function treeReducer(state, action) {
        const tree = state;

        //currentNode describes what will become the parent of whatever children are getting made

        // partition describes the partition into 

        //Index describes the future position of the new child to be created
        const { currentNode, childContent, partition, index, type } = action;
        switch (type) {
            case "split_it":
                let child;
                let newChildrenArray = [...(tree.children)];

                // Additional splits (splitting off of the thing to the left of the index so if we split 5, we're taking 4 and cutting it and the cut off bit becomes the new 5. The old 5 shifts to 6
                if (currentNode.children?.length > 0 && index - 1 >= 0) {
                    let prevsWidths = 0;
                    for (let i = 0; i < index; i++) {
                        prevsWidths += currentNode.children[i].partition;
                    }
                    const newNodePartition = Math.max(
                        currentNode.children[index - 1].partition - partition,
                        0,
                    );
                    currentNode.children[index - 1].partition = partition;
                    child = createModuleNode(
                        newNodePartition,
                        currentNode.level + 1,
                        currentNode,
                        childContent,
                    );
                    currentNode.children.splice(index, 0, child);
                    newChildrenArray.splice(index, 0, child);

                    
                // Initial split (parent keeps its content on left child, add new node on the right)
                } else if (currentNode.children.length <= 0) {
                    currentNode.isVertical = currentNode.parent
                        ? !currentNode.parent.isVertical
                        : false;
                    child = createModuleNode(
                        partition,
                        currentNode.level + 1,
                        currentNode,
                        currentNode.content,
                    );
                    const child2 = createModuleNode(
                        100 - partition,
                        currentNode.level + 1,
                        currentNode,
                        childContent,
                    );
                    currentNode.children.splice(0, 0, child);
                    currentNode.children.splice(1, 0, child2);
                    newChildrenArray[0] = child;
                    newChildrenArray[1] = child2;
                }
                return { ...tree, children: newChildrenArray};
            case "clear_children":
                currentNode.children = [];
        }
    }

    const [tree, dispatchTree] = useReducer(
        treeReducer,
        createModuleNode(100, 0, null, "Hello", false),
    );

    // useEffect(() => {
    //     dispatchTree({
    //         type: "split_it",
    //         partition: 50,
    //         childContent: "Thing",
    //         index: 0,
    //     });

    //     return () => {
    //         dispatchTree({
    //             type: "clear_children"
    //         })
    //     }
    // }, []);

    return (
        <>
            <ModuleNode obj={tree} splitFunc={dispatchTree}></ModuleNode>
        </>
    );
}

export default Display;
