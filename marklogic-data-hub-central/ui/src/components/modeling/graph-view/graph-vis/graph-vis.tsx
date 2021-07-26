import React, {useState, useEffect, useLayoutEffect, useRef} from "react";
import {Link} from "react-router-dom";
import Graph from "react-graph-vis";
import "./graph-vis.scss";
import ReactDOMServer from "react-dom/server";
import {faFileExport, faTrashAlt, faAddressBook, faAmbulance} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import NodeSvg from "./node-svg";
import { Menu, Dropdown } from 'antd';
import { DataSet } from 'vis-data';

type Props = {
  entityTypes: any;
  handleEntitySelection: any;
};

const defaultNodeProps: any = {
  shape: "box",
  shapeProperties: {
    borderRadius: 2
  },
  icon: {
    face: '"Font Awesome 5 Free"',
    code: "\f82f",
    size: 50,
    color: "#f0a30a",
  },
  font: {
    multi: true,
    align: "left",
    bold: {
      color: "#6773af",
      vadjust: 3,
      size: 12
    },
  },
  margin: 10,
  widthConstraint: {
    minimum: 80
  },
};

const GraphVis: React.FC<Props> = (props) => {

  const graphRef = useRef(null);
  let graphType = "shape";
  //let graphType = "image";

  let emptyNodes = new DataSet();
  let emptyEdges = new DataSet();

  const [nodePositions, setNodePositions] = useState({});
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  //const [graphData, setGraphData] = useState({nodes: [], edges: []});
  const [graphData, setGraphData] = useState({nodes: emptyNodes, edges: emptyEdges});
  const [testingMode, setTestingMode] = useState(true); // Should be used further to handle testing only in non-production environment
  
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuChanged, setContextMenuChanged] = useState(false);
  const [contextClick, setContextClick] = useState(false);

  const [clickedNode, setClickedNode] = useState("");

  //Initializing network instance
  const [network, setNetwork] = useState<any>(null);
  const initNetworkInstance = (networkInstance) => {
    setNetwork(networkInstance);
  };
  const [hoveringNode, setHoveringNode] = useState<string | undefined>(undefined);
  const hoverColor: string = "#E9F7FE";

  // Initialize or update graph
  useEffect(() => {
    // TODO use DataSet to performantly manage changes to graph data (don't rerender everything on change)
    let nodes = new DataSet(getNodes());
    setGraphData({
      //nodes: nodes,
      nodes: getNodes(),
      edges: getEdges()
    });
    // let items = emptyDataSet.get();
    // console.log("emptyDataSet", items);
  }, [props.entityTypes]);

  // useEffect(() => {
  //   // TODO use DataSet to performantly manage changes to graph data (don't rerender everything on change)
  //   let nodes = new DataSet(getNodes());
  //   setGraphData({
  //     //nodes: nodes,
  //     nodes: getNodes(),
  //     edges: getEdges()
  //   });
  // }, [hoveringNode]);

  useLayoutEffect(() => {
    if (testingMode && network) {
      window.graphVisApi = {
        getGraphNodes: (nodeId) => { return network.getPosition(nodeId); },
        canvasToDOM: (x, y) => { return network.canvasToDOM({x: x, y: y}); },
      };
    }
  }, [network]);

  //Use these to set specific positions for entity nodes temporarily
  let nodeP = {
    BabyRegistry: {
      x: 134.5, y: -165
    },
    Customer: {
      x: -1.8683534551792256, y: -13.817459136071609
    },
    Product: {
      x: -290.5, y: -57
    },
    Order: {
      x: 311.5, y: 1
    },
    NamespacedCustomer: {
      x: -193.56170318899566, y: 27.318452823974837
    },
    Person: {
      x: -143.5, y: -143
    }
  };

  let entityMetadata = {
    BabyRegistry: {
      color: "#e3ebbc",
      instances: 5,
      icon: <FontAwesomeIcon icon={faFileExport} aria-label="BabyRegistry-icon" />
    },
    Customer: {
      color: "#ecf7fd",
      instances: 63,
      icon: <FontAwesomeIcon icon={faTrashAlt} aria-label="graph-export" />
    },
    Product: {
      color: "#ded2da",
      instances: 252,
      icon: <FontAwesomeIcon icon={faTrashAlt} aria-label="graph-export" />
    },
    Order: {
      color: "#cfe3e8",
      instances: 50123,
      icon: <FontAwesomeIcon icon={faTrashAlt} aria-label="graph-export" />
    },
    NamespacedCustomer: {
      color: "#dfe2ec",
      instances: 75,
      icon: <FontAwesomeIcon icon={faAddressBook} aria-label="graph-export" />
    },
    Person: {
      color: "#dfe2ec",
      instances: 75,
      icon: <FontAwesomeIcon icon={faAmbulance} aria-label="graph-export" />
    }
  };

  const getIcon = (entityName) => {
    let icon = <FontAwesomeIcon icon={faFileExport} aria-label="node-icon" />;
    if (entityMetadata[entityName] && entityMetadata[entityName].icon) {
      icon = entityMetadata[entityName].icon;
    }
    return ReactDOMServer.renderToString(icon);
  };

  const getColor = (entityName) => {
    let color = "#cfe3e8";
    if (hoveringNode === entityName) {
      color = hoverColor;
    } else if (entityMetadata[entityName] && entityMetadata[entityName].color) {
      color = entityMetadata[entityName].color;
    }
    return color;
  };

  const getNumInstances = (entityName) => {
    let num = 123;
    if (entityMetadata[entityName] && entityMetadata[entityName].instances) {
      num = entityMetadata[entityName].instances;
    }
    return num;
  };

  const getNodes = () => {
    let nodes;
    if (graphType === "image") {
      nodes = props.entityTypes && props.entityTypes?.map((e) => {
        const node = new NodeSvg(e.entityName, getColor(e.entityName), getNumInstances(e.entityName), getIcon(e.entityName));
        return {
          id: e.entityName,
          label: "",
          title: e.model.definitions[e.entityName].description ? e.model.definitions[e.entityName].description : "Description is not available for the entity",
          image: "data:image/svg+xml;charset=utf-8," + node.getSvg(),
          shape: "image",
          chosen: function (values, id, selected, hovering) {
            values.color = "#00ff00";
            values.strokeWidth = 5;
          }
        };
      });
    } else if (graphType === "shape") {
      nodes = props.entityTypes && props.entityTypes?.map((e) => {
        return {
          ...defaultNodeProps,
          id: e.entityName,
          label: e.entityName.concat("\n<b>", getNumInstances(e.entityName), "</b>"),
          title: e.entityName + " tooltip text",
          color: {
            background: getColor(e.entityName),
            hover: {
              background: hoverColor,
              border: "red"
            }
          },
          hidden: false
        }
      });
    }
    return nodes;
  };

  const getEdges = () => {
    let edges: any = [];
    props.entityTypes.forEach((e, i) => {
      let properties: any = Object.keys(e.model.definitions[e.entityName].properties);
      properties.forEach((p, i) => {
        if (e.model.definitions[e.entityName].properties[p].relatedEntityType) {
          let parts = e.model.definitions[e.entityName].properties[p].relatedEntityType.split("/");
          edges.push({
            from: e.entityName,
            to: parts[parts.length - 1],
            label: e.model.definitions[e.entityName].properties[p].joinPropertyName,
            arrows: "to",
            color: "#666",
            font: {align: "top"}
          });
        }
      });
    });
    return edges;
  };

  const options = {
    layout: {
      //hierarchical: true
      //randomSeed: "0.7696:1625099255200",
    },
    edges: {
      color: "#000000"
    },
    height: "500px",
    physics: {
      enabled: physicsEnabled,
      barnesHut: {
        springLength: 160,
        avoidOverlap: 0.4
      }
    },
    interaction: {
      hover: true
    },
    manipulation: {
      enabled: false,
      addNode: function (data, callback) {
        // filling in the popup DOM elements
        console.log("add", data);
      },
      editNode: function (data, callback) {
        // filling in the popup DOM elements
        console.log("edit", data);
      },
      addEdge: function (data, callback) {
        //   console.log('add edge', data);
      }
    }
  };

  const events = {
    /* "oncontext" may not include node that was clicked so we have check it in "click"
     * to accurately open the context menu when a node is right-clicked. "click" fires 
     * AFTER "oncontext" so we can check an oncontext flag and the node array.
     *
     */
    click: (event) => {
      console.log("click", event);
      console.log("click nodes", network);
      let {nodes, edges} = event;
      // Was iit originally an oncontext click and was it on a node?
      if (contextClick && nodes.length > 0) {
        setClickedNode(nodes[0])
        setContextMenuVisible(true);
      } else {
        setContextMenuVisible(false);
      }
      setContextClick(false); // reset flag
    },
    select: (event) => {
      console.log("select", event);
      let {nodes, edges} = event;
      if (nodes.length > 0) {
        props.handleEntitySelection(nodes[0]);
        // console.log("Node: ", nodes[0], "event x: ", event.event.center.x, "event y: ", event.event.center.y);
        // let positions = network.getPositions(nodes[0]);
        // console.log("node x: ", positions[nodes[0]].x, "node y: ", positions[nodes[0]].y);
        // console.log("canvas x: ", event.pointer.canvas.x, "canvas y: ", event.pointer.canvas.y);
        // console.log(network);
        // console.log(event);
      }
    },
    dragStart: (event) => {
      if (physicsEnabled) {
        setPhysicsEnabled(false);
      }
    },
    dragEnd: (event) => {
      console.log("dragEnd", event, event.pointer.canvas);
      setNodePositions({[event.nodes[0]]: event.pointer.canvas});
    },
    hoverNode: (event) => {
      //console.log("on hover node", event, document);
      event.event.target.style.cursor = "pointer";
      //setHoveringNode(event.node);
    },
    blurNode: (event) => {
      //console.log("on blur node", event);
      event.event.target.style.cursor = "";
      //setHoveringNode(undefined);
    },
    hoverEdge: (event) => {
      //console.log("on hover edge", event.event.target.style.cursor);
      event.event.target.style.cursor = "pointer";
    },
    blurEdge: (event) => {
      //console.log("on blur edge", event);
      event.event.target.style.cursor = "";
    },
    doubleClick: (event) => {
      console.log("doubleClick", event);
    },
    oncontext: (event) => {
      console.log("oncontext", event);
      event.event.preventDefault(); // don't display regular context menu
      setContextClick(true);
    }
  };

  const menuClick = (event) => {
    console.log("menuClick", event);
    // TODO do something useful
    setContextMenuVisible(false);
  };

  const menu = () => {
    console.log("clickedNode", clickedNode);
    return (
    // <Menu onClick={menuClick}>
    <Menu onClick={menuClick}>
      <Menu.Item key="1">
        <Link
          to={{
            pathname: "/tiles/explore",
            state: {entity: clickedNode}
          }}
        >
         {123}
        </Link>
      </Menu.Item>
      <Menu.Item key="2">2nd menu item</Menu.Item>
      <Menu.Item key="3">3rd menu item</Menu.Item>
    </Menu>
  )};

  return (
    <div id="graphVis">
      <Dropdown 
        overlay={menu} 
        trigger={['contextMenu']}
        visible={contextMenuVisible}
      >
        <div>
          <Graph
            graph={graphData}
            options={options}
            events={events}
            getNetwork={initNetworkInstance}
          />
        </div>
      </Dropdown>
    </div>
  );
};

export default GraphVis;