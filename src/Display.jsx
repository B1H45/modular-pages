import { useState, useEffect, useRef, useReducer } from "react";
import ModuleNode from "./ModuleNode";
import { Stage, Layer, Line } from "react-konva";
import "./styles/App.css";
import {useImmer} from "use-immer";

function Display() {
    let idTracker = useRef(0);

    function createModuleNode(partition, level, parent, content, isVertical) {
        const node = {
            partition,
            parent,
            children: [],
            level,
            content,
            isVertical,
            id: (() => {
                const returnId = idTracker.current;
                idTracker.current = idTracker.current + 1;
                return returnId;
            })(),
            isLast() {
                return (
                    tree.getNode(node.parent?.id)?.children?.length - 1 ==
                        tree.getNode(node.id)?.getIndex() ?? true
                );
            },
            getIndex() {
                return (
                    tree.getNode(node.parent?.id)?.children?.indexOf(node) ?? 0
                );
            },
        };

        return node;
    }

    function createTree(root) {
        const tree = {
            root,
            nodes: [root],

            //get an object by its id
            getNode(id) {
                return this.nodes.find((node) => node.id === id);
            },
            refreshNodeContents(nodes) {
                for (const node of nodes) {
                    const index = this.nodes.findIndex((n) => n.id === node.id);
                    if (index !== -1) {
                        this.nodes[index] = node;
                    } else {
                        this.nodes.push(node);
                    }
                }
            },
        };

        return tree;
    }

    function treeReducer(state, action) {
        const tree = state;
        //currentNode describes what will become the parent of whatever children are getting made

        //partition describes the partition into

        //Index describes the future position of the new child to be created
        const { currentNodeId, childContent, partition, index, type } = action;

        switch (type) {
            case "split_it":
                const newTree = { ...tree };
                const newCurrentNode = newTree.getNode(currentNodeId);
                let newChildrenArray = [...newCurrentNode.children];

                let child;

                // Additional splits (splitting off of the thing to the left of the index so if we split 5, we're taking 4 and cutting it and the cut off bit becomes the new 5. The old 5 shifts to 6
                if (newCurrentNode.children?.length > 0 && index - 1 >= 0) {
                    let prevsWidths = 0;
                    for (let i = 0; i < index; i++) {
                        prevsWidths += newCurrentNode.children[i].partition;
                    }
                    const newNodePartition = Math.max(
                        newCurrentNode.children[index - 1].partition -
                            partition,
                        0,
                    );

                    // currentNode.children[index - 1].partition = partition;
                    child = createModuleNode(
                        newNodePartition,
                        newCurrentNode.level + 1,
                        newCurrentNode,
                        childContent,
                    );
                    // currentNode.children.splice(index, 0, child);
                    newChildrenArray[index - 1].partition = partition;
                    newChildrenArray.splice(index, 0, child);

                    // Initial split (parent keeps its content on left child, add new node on the right)
                } else if (newCurrentNode.children.length <= 0) {
                    newCurrentNode.isVertical = newCurrentNode.parent
                        ? !newCurrentNode.parent.isVertical
                        : false;
                    child = createModuleNode(
                        partition,
                        newCurrentNode.level + 1,
                        newCurrentNode,
                        newCurrentNode.content,
                    );
                    const child2 = createModuleNode(
                        100 - partition,
                        newCurrentNode.level + 1,
                        newCurrentNode,
                        childContent,
                    );

                    // newCurrentNode.children.splice(0, 0, child);
                    // newCurrentNode.children.splice(1, 0, child2);
                    newChildrenArray[0] = child;
                    newChildrenArray[1] = child2;
                }

                newTree.refreshNodeContents([
                    newCurrentNode,
                    ...newChildrenArray,
                ]);
                newCurrentNode.children = [...newChildrenArray];

                return newTree;
            case "clear_children":
                newCurrentNode.children = [];
        }
    }

    const [tree, dispatchTree] = useReducer(
        treeReducer,
        createTree(createModuleNode(100, 0, null, "Root", false)),
    );

    return (
        <>
            <ModuleNode
                obj={tree.root}
                tree={tree}
                splitFunc={dispatchTree}
            ></ModuleNode>
        </>
    );
}

export default Display;
