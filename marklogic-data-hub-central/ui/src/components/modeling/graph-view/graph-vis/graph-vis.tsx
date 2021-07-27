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
import {useHistory} from "react-router-dom";

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

var nodesDS2 = [
  {id: 1, label: 'Node 1'},
  {id: 2, label: 'Node 2'},
  {id: 3, label: 'Node 3'},
  {id: 4, label: 'Node 4'},
  {id: 5, label: 'Node 5'}
];

var edgesDS = new DataSet([
  {id: "a", from: 1, to: 3},
  {id: "b", from: 1, to: 2},
  {id: "c", from: 2, to: 4},
  {id: "d", from: 2, to: 5}
]);

var edgesDS2 = [
  {id: "a", from: 1, to: 3},
  {id: "b", from: 1, to: 2},
  {id: "c", from: 2, to: 4},
  {id: "d", from: 2, to: 5}
];

const GraphVis: React.FC<Props> = (props) => {

  var nodesDS: any = new DataSet([
    {
      id: "Customer",
      shape: "box",
      label: "Test",
    }
  ]);

  let history = useHistory();

  const graphRef = useRef(null);
  let graphType = "shape";
  //let graphType = "image";

  let emptyNodes = new DataSet();
  let emptyEdges = new DataSet();

  interface GraphData {
    nodes: any;
    edges: any;
  }

  const [nodePositions, setNodePositions] = useState({});
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  //const [graphData, setGraphData] = useState({nodes: [], edges: []});
  const [graphData, setGraphData] = useState<GraphData>({nodes: nodesDS, edges: emptyEdges});
  const [testingMode, setTestingMode] = useState(true); // Should be used further to handle testing only in non-production environment
  
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuChanged, setContextMenuChanged] = useState(false);
  const [contextClick, setContextClick] = useState(false);

  const [clickedNode, setClickedNode] = useState("");
  const [clickedEdge, setClickedEdge] = useState("");

  //Initializing network instance
  const [network, setNetwork] = useState<any>(null);
  const initNetworkInstance = (networkInstance) => {
    setNetwork(networkInstance);
  };
  const [hoveringNode, setHoveringNode] = useState<string | undefined>(undefined);
  const hoverColor: string = "#E9F7FE";

  const [hoveringInstances, setHoveringInstances] = useState<string | undefined>(undefined);
  const hoverInstances: string = "#CC0000";

  // Initialize or update graph
  // @ts-ignore
  useEffect(() => {
    // TODO use DataSet to performantly manage changes to graph data (don't rerender everything on change)
    // let nodes = new DataSet(getNodes());
    let nodes1 = getNodes();
    console.log("nodes1", nodes1);
    if (nodes1.length > 0) {
      let nodes = new DataSet(getNodes());
      console.log("nodes", nodes);
      nodesDS.update({id: "Customer", label: "Changed"})
      // setGraphData({
      //   nodes: nodes,
      //   //nodes: getNodes(),
      //   edges: getEdges()
      // });
    }
    // let items = emptyDataSet.get();
    // console.log("emptyDataSet", items);
  }, [props.entityTypes, hoveringNode]);

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
          //title: e.model.definitions[e.entityName].description ? e.model.definitions[e.entityName].description : "Description is not available for the entity",
          title: e.entityName + " tooltip text",
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

  // Settings for determining numInstance clicks for different graph types
  const graphSettings: any = {
    image: {
      numInstances: {
        leftOffset: 6.5,
        topOffset:  27,
        height: 7,
        numWidth: 6.5
      }
    },
    shape: {
      numInstances: {
        leftOffset: 12,
        topOffset:  28,
        height: 9,
        numWidth: 6.5
      }
    }
  };

  // Given a number, how many digits are in it?
  const getNumDigits = (num) => {
    return num.toString().length;
  }

  // Given a node ID, a set of coordinates from a click, and a network object,
  // return whether the click coordinates occurred within the node.
  const insideNumInstances = (entityName, numDigits, pointerX, pointerY, network) => {
    // bounds for node shape
    let left = network.body.nodes[entityName].shape.left;
    let top = network.body.nodes[entityName].shape.top;
    // bounds for instances container
    let leftNums = left + graphSettings[graphType].numInstances.leftOffset;
    let topNums = top + graphSettings[graphType].numInstances.topOffset;
    let heightNums = graphSettings[graphType].numInstances.height;
    let widthNums = graphSettings[graphType].numInstances.numWidth * numDigits;
    return (
      (pointerY > topNums) && (pointerY < (topNums + heightNums)) &&
      (pointerX > leftNums) && (pointerX < (leftNums + widthNums)))
  }

  const getMethods = (obj) => {
    let properties: any = new Set()
    let currentObj = obj
    do {
      Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
    } while ((currentObj = Object.getPrototypeOf(currentObj)))
    return [...properties.keys()].filter(item => typeof obj[item] === 'function')
  }

  const events = {
    /* "oncontext" may not include node that was clicked so we have check it in "click"
     * to accurately open the context menu when a node is right-clicked. "click" fires 
     * AFTER "oncontext" so we can check an oncontext flag and the node array.
     */
    click: (event) => {
      console.log("click event", event);
      console.log("click network", network);
      //console.log(event.pointer.canvas.x, event.pointer.canvas.y);
      let {nodes, edges} = event;
      // if (nodes.length > 0) {
      //   console.log("instancesClicked", insideNumInstances(nodes[0], getNumDigits(entityMetadata[nodes[0]].instances), event.pointer.canvas.x, event.pointer.canvas.y, network));
      // }
      // Was iit originally an oncontext click and was it on a node?
      if (contextClick && nodes.length > 0) {
        setClickedNode(nodes[0]);
        setClickedEdge("");
        setContextMenuVisible(true);
      }  else if (contextClick && edges.length > 0) {
        setClickedNode("");
        setClickedEdge(edges[0]);
        setContextMenuVisible(true);
      } 
      else if (nodes.length > 0 && insideNumInstances(nodes[0], getNumDigits(entityMetadata[nodes[0]].instances), event.pointer.canvas.x, event.pointer.canvas.y, network)) {
        console.log("instances number WAS CLICKED!");
        setContextMenuVisible(false);
        history.push({
          pathname: "/tiles/explore",
          state: {entity: nodes[0]}
        });
      } 
      else {
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
      console.log("on hover node", event, document, network);
      console.log("getMethods network", getMethods(network));
      event.event.target.style.cursor = "pointer";
      setHoveringNode(event.node);
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
      { clickedNode &&
      <Menu.Item key="1">
        <Link to={{ pathname: "/tiles/explore", state: {entity: clickedNode}}}>
          {"Explore " + clickedNode + " instances"}
        </Link>
      </Menu.Item> }
      { clickedNode &&
      <Menu.Item key="1">
        {"Delete entity"}
        </Menu.Item> }
      { clickedEdge &&
      <Menu.Item key="1">
        {"Edit relationship"}
      </Menu.Item> }
      { clickedEdge &&
      <Menu.Item key="1">
        {"Delete relationship"}
      </Menu.Item> }
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
          { props.entityTypes && 
          <Graph
            graph={graphData}
            options={options}
            events={events}
            getNetwork={initNetworkInstance}
          />
          }
        </div>
      </Dropdown>
    </div>
  );
};

export default GraphVis;