import { useEffect, useState, useRef } from "react";
import { Stage, Layer, Line } from "react-konva";

function ModuleNode(props) {
    let { progress, level, content, side } = props;
    let [from, setFrom] = useState(null);
    let [to, setTo] = useState(null);
    let [splitting, setSplitting] = useState(false);
    let thisNode = useRef(this);

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
        }

        return () => {
            window.removeEventListener("mousemove", _updateAnimVars);
        };
    });

    // constructor(progress, level, content) {
    //     progress = progress;
    //     from = null;
    //     to = null;
    //     level = level;
    //     content = content;
    // }

    const _updateAnimVars = (ev) => {
        setMousePosition({ x: ev.clientX, y: ev.clientY });
        setSplitterPosition({
            x: ev.clientX - thisNode.current.getBoundingClientRect().left,
            y: 0,
        });
    };
    const _endSplit = () => {
        setSplitting(false);
        createChild();
    };

    function _beginSplit(e) {
        e.preventDefault();
        console.log(e);
        setSplitting(true);
        _updateAnimVars(e);
    }

    function createChild(side) {
        // setFrom(ModuleNode);
    }

    function render(side, progress) {
        let arr = [];
        for (let i = 0; i < 50; i++) {
            arr.push(i);
        }

        //This node's properties
        let thisClass = side == "to" ? "module to" : "module from";
        let thisStyle = {
            "--level": level,
            "--progress": progress,
            flexDirection: (level + 1) % 2 == 0 ? "column" : "row",
        };
        //Render an empty module
        function _renderPlaceholder() {
            return (
                <div className="module" style={{ "--level": level + 1 }}></div>
            );
        }

        //Render this node
        function renderThis(inner) {
            return (
                <div
                    onContextMenu={(e) => {
                        _beginSplit(e);
                    }}
                    className={thisClass}
                    style={thisStyle}
                    ref={thisNode}
                >
                    {inner}
                </div>
            );
        }

        //If we've got any children, render them
        // if (from || to) {
        //     return renderThis(
        //         <>
        //             {from
        //                 ? from.render("from", progress)
        //                 : _renderPlaceholder()}
        //             {to ? to.render("to", progress) : _renderPlaceholder()}
        //         </>,
        //     );

        //     //If no children, render some sort of content
        // } else if (content) {
        //     return renderThis(
        //         <>
        //             {arr.map((num) => {
        //                 return <p key={num}>{content}</p>;
        //             })}
        //         </>,
        //     );
        // }

        function renderSplitter() {
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

        return renderThis(
            <>
                {from || to ? (
                    <>
                        {" "}
                        {from
                            ? from.render("from", progress)
                            : _renderPlaceholder()}
                        {to ? to.render("to", progress) : _renderPlaceholder()}
                    </>
                ) : content ? (
                    <>
                        {arr.map((num) => {
                            return <p key={num}>{content}</p>;
                        })}
                    </>
                ) : (
                    ""
                )}
                {renderSplitter()}
            </>,
        );
    }

    return <>{render()}</>;
}

export default ModuleNode;
