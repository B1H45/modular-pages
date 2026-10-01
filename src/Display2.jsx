import { useState, useEffect, useRef } from "react";
import ModuleNode2 from "./ModuleNode2";
import { Stage, Layer, Line } from "react-konva";
import "./App.css";

function Display2() {
    class moduleNode {
        constructor(progress, level, parent, content) {
            this.progress = progress;
            this.parent = parent;
            this.from = null;
            this.to = null;
            this.level = level;
            this.content = content;
        }

        getSide() {
            if (this.parent) {
                return this.parent.from == this ? "from" : "to";
            } else {
                return "";
            }
        }

        createChild(side, content, partition) {
            let child = new moduleNode(50, this.level + 1, this, content);
            side == "from" ? (this.from = child) : (this.to = child);
            this.progress = partition ?? this.progress;
            return child;
        }
    }

    let root = new moduleNode(50, 0, null, "Hello");
    // let l1 = createChild(root, "from", "From Content");
    // let l2 = createChild(root, "to", "To Content", 80);

    return (
        <>
            <ModuleNode2 obj={root}></ModuleNode2>
        </>
    );
}

export default Display2;
