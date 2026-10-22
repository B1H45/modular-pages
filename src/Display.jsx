import { useState, useEffect, useRef, useReducer } from "react";
import ModuleNode from "./ModuleNode";
import { Stage, Layer, Line } from "react-konva";
import "./styles/App.css";

import { create } from "mutative";
import { useMutativeReducer } from "use-mutative";

function Display() {
    let idTracker = useRef(0);

    class moduleNode {
        constructor(partition, level, parent, content, isVertical) {
            this.partition = partition;
            this.parent = parent;
            this.children = [];
            this.level = level;
            this.content = content;
            this.isVertical = isVertical;
        }

        isLast() {
            return (
                this.parent?.children.indexOf(this) ==
                    this.parent?.children.length - 1 ?? true
            );
        }

        //gets index within it's parent's children list
        getIndex() {
            return this.parent?.children.indexOf(this);
        }

        splitIt(childContent, partition, index) {
            let child;
            if (this.children.length > 0) {
                let prevsWidths = 0;
                for (let i = 0; i < index; i++) {
                    prevsWidths += this.children[i].partition;
                }
                const newNodePartition = Math.max(
                    this.children[index - 1].partition - partition,
                    0,
                );
                this.children[index - 1].partition = partition;
                child = new moduleNode(
                    newNodePartition,
                    this.level + 1,
                    this,
                    childContent,
                );
                this.children.splice(index, 0, child);
            } else {
                this.isVertical = this.parent ? !this.parent.isVertical : false;
                child = new moduleNode(
                    partition,
                    this.level + 1,
                    this,
                    this.content,
                );
                const child2 = new moduleNode(
                    100 - partition,
                    this.level + 1,
                    this,
                    childContent,
                );
                this.children.splice(0, 0, child);
                this.children.splice(1, 0, child2);
            }
            return child;
        }

        createChild(content, partition, index) {
            let child = new moduleNode(
                partition,
                this.level + 1,
                this,
                content,
            );
            this.children.splice(index, 0, child);
            // setRoot(rootNode);
            return child;
        }
    }

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
                    treeState.getNode(node.parent?.id)?.children?.length - 1 ==
                        node.getIndex() ?? true
                );
            },
            getIndex() {
                return (
                    treeState.getNode(node.parent?.id)?.children?.indexOf(node) ?? 0
                );
            },
        };

        return node;
    }

    function createTree(root) {
        const tree = {
            root,

            //get an object by its id
            getNode(id, node = this.root) {
                if (!node) return undefined;

                if (node.id === id) return node;

                for (const child of node.children) {
                    const result = this.getNode(id, child);
                    if (result) return result;
                }
                return undefined;
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

    function treeReducer(draft, action) {
        switch (action.type) {
            case "split":
                const { obj, newPartition, childContent, index } = action;
                const node = draft.getNode(obj.id);
                let child;

                if (node.children.length > 0) {
                    let prevsWidths = 0;
                    for (let i = 0; i < index; i++) {
                        prevsWidths += node.children[i].partition;
                    }
                    const newNodePartition = Math.max(
                        node.children[index - 1].partition - newPartition,
                        0,
                    );
                    node.children[index - 1].partition = newPartition;
                    child = createModuleNode(
                        newNodePartition,
                        node.level + 1,
                        node,
                        childContent,
                    );
                    node.children.splice(index, 0, child);
                } else {
                    node.isVertical = node.parent
                        ? !node.parent.isVertical
                        : false;
                    child = createModuleNode(
                        newPartition,
                        node.level + 1,
                        node,
                        node.content,
                    );
                    const child2 = createModuleNode(
                        100 - newPartition,
                        node.level + 1,
                        node,
                        childContent,
                    );
                    node.children.splice(0, 0, child);
                    node.children.splice(1, 0, child2);
                }

                return;
        }
    }

    const tree = createTree(createModuleNode(100, 0, null, "Root", false));

    const [treeState, dispatchTree] = useMutativeReducer(treeReducer, tree);

    return (
        <>
            <ModuleNode
                obj={treeState.root}
                dispatchTree={dispatchTree}
            ></ModuleNode>
        </>
    );
}

export default Display;
