import { useState, useEffect, useRef } from "react";
import ModuleNode2 from "./ModuleNode2";
import { Stage, Layer, Line } from "react-konva";
import "./App.css";

function Display() {
    let [splitting, setSplitting] = useState(false);
    let activeNode = useRef(null);

    const [mousePosition, setMousePosition] = useState({
        x: null,
        y: null,
    });
    const [splitterPosition, setSplitterPosition] = useState({
        x: null,
        y: null,
    });

    useEffect(() => {
        if (splitting) {
            window.addEventListener("mousemove", _updateAnimVars);
            window.addEventListener("click", _endSplit);
            // console.log(splitterPosition);
            activeNode.current?.domElement.classList.add("active");
        }

        return () => {
            window.removeEventListener("mousemove", _updateAnimVars);
            activeNode.current?.domElement.classList.remove("active");
        };
    });

    const _updateAnimVars = (ev, axis) => {
        setMousePosition({ x: ev.clientX, y: ev.clientY });
        if (axis == "x") {
            setSplitterPosition({
                x: ev.clientX - activeNode.current.domElement.getBoundingClientRect().left,
                y: 0,
            });
        } else {
            setSplitterPosition({
                x: ev.clientX - activeNode.current.domElement.getBoundingClientRect().left,
                y: 0,
            });
        }
    };
    const _endSplit = () => {
        setSplitting(false);
        // createChild();
    };

    const _beginSplit = (e, thisNode) => {
        e.preventDefault();
        activeNode.current = thisNode;
        if (!splitting) {
            console.log(e);
            setSplitting(true);
        }
    }

    class moduleNode {
        constructor(progress, level, content) {
            this.progress = progress;
            this.from = null;
            this.to = null;
            this.level = level;
            this.content = content;
            this.domElement = useRef(null);
        }

        render(side, progress) {
            let arr = [];
            for (let i = 0; i < 50; i++) {
                arr.push(i);
            }

            //This node's properties
            let thisClass = side == "to" ? "module to" : "module from";
            let thisStyle = {
                "--level": this.level,
                "--progress": progress,
                flexDirection: (this.level + 1) % 2 == 0 ? "column" : "row",
            };
            //Render an empty module
            const renderPlaceholder = () => {
                return (
                    <div
                        className="module"
                        style={{ "--level": this.level + 1 }}
                    ></div>
                );
            }

            //Render this node
            const renderThis = (inner) => {
                return (
                    <div
                        ref={this.domElement}
                        onContextMenu={(e) => {
                            e.stopPropagation();
                            _beginSplit(e, this);
                        }}
                        className={thisClass}
                        style={thisStyle}
                        obj={this}
                    >
                        {inner}
                        {renderSplitter()}
                    </div>
                );
            }
            const renderSplitter = () => {
                return (
                    <Stage
                        className={`splitter${!splitting ? " hide" : ""}`}
                        width={window.innerWidth}
                        height={window.innerHeight}
                    >
                        <Layer>
                            <Line
                                x={splitterPosition.x}
                                y={splitterPosition.y}
                                points={[0, 0, 0, window.innerHeight]}
                                stroke="red"
                            ></Line>
                        </Layer>
                    </Stage>
                );
            }

            //If we've got any children, render them
            if (this.from || this.to) {
                return renderThis(
                    <>
                        {this.from
                            ? this.from.render("from", this.progress)
                            : renderPlaceholder()}
                        {this.to
                            ? this.to.render("to", this.progress)
                            : renderPlaceholder()}
                    </>,
                );

                //If no children, render some sort of content
            } else if (this.content) {
                return renderThis(
                    <>
                        {arr.map((num) => {
                            return <p key={num}>{this.content}</p>;
                        })}
                    </>,
                );
            }
        }
    }

    let root = new moduleNode(80, 0, "Hello");
    root.from = new moduleNode(95, 1, "Hello");
    root.to = new moduleNode(40, 1, "Thing");
    root.from.to = new moduleNode(50, 2, ".");
    root.from.from = new moduleNode(50, 2, ".");
    root.to.to = new moduleNode(70, 2, ".");
    root.to.from = new moduleNode(50, 2, ".");
    root.to.to.to = new moduleNode(70, 3, ".");
    root.to.to.from = new moduleNode(70, 3, ".");

    return (
        <>
            <div className="module">{root.render()}</div>
        </>
    );
}

export default Display;
