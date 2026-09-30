import { useEffect, useState, useRef } from "react";
import { Stage, Layer, Line } from "react-konva";

function ModuleNode2(props) {
    let thisNode = useRef(this);
    const {inner} = props;
    
    return <>{inner}</>;
}

export default ModuleNode2;
