import { useState, useEffect, useRef, useReducer } from "react";
import ModuleNode from "./ModuleNode";
import { Stage, Layer, Line } from "react-konva";
import "./styles/App.css";

function Display() {
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

    const [root, setRoot] = useState(new moduleNode(100, 0, null, "Hello"));
    useEffect(() => {
        const newRoot = structuredClone(root);
        newRoot.splitIt("Child 1", 20, 0, true);
        setRoot(newRoot);
    }, []);

    return (
        <>
            <ModuleNode obj={root}></ModuleNode>
        </>
    );
}

export default Display;
