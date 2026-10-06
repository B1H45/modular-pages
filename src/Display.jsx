import { useState, useEffect, useRef } from "react";
import ModuleNode from "./ModuleNode";
import { Stage, Layer, Line } from "react-konva";
import "./styles/App.css";

function Display() {
    class moduleNode {
        constructor(partition, level, parent, content) {
            this.partition = partition;
            this.parent = parent;
            this.children = [];
            this.level = level;
            this.content = content;
        }

        isLast() {
            return this.parent?.children.indexOf(this) == this.parent?.children.length-1 ?? true;
        }

        createChild(content, partition, index) {
            let child = new moduleNode(partition, this.level + 1, this, content);
            this.children.splice(index, 0, child);
            return child;
        }
    }

    let root = new moduleNode(100, 0, null, "Hello");
    root.createChild("Child 1", 20, 0);
    root.createChild("Child 2", 80, 1);

    return (
        <>
            <ModuleNode obj={root}></ModuleNode>
        </>
    );
}

export default Display;
