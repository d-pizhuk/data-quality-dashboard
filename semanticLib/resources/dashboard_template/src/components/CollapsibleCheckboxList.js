import React, { useEffect, useRef, useState } from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import Checkbox from '@mui/material/Checkbox';
import consistency_data from "../static_data/data/consistency.json";
import DoughnutChartComp from "./DoughnutChartComp";
import './styles/CollapsibleCheckboxList.css';
import { createTooltip } from "./utils";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReactDOMServer from 'react-dom/server';


const CollapsibleCheckboxList = ({ data, metadata, listTitle, listSubtitle, doughnutChartTitle, depthLabels, extraInfo }) => {
    const isFirstRender = useRef(true);
    const [checkedItems, setCheckedItems] = useState({});
    const [nonConflictTriplesPercentage, setNonConflictTriplesPercentage] = useState(1)
    const checkBoxStyle = {
        color: '#282c34',
        '&.Mui-checked': { color: '#282c34' },
        transition: 'none !important',
    }
    const UNIQUE_SPLIT = "sp/&"
    const tooltip = createTooltip()

    const getAllChildKeys = (node, parentKey = '') => {
        let keys = [];

        if (Array.isArray(node)) {
            keys = [...keys, ...node.map(item => `${parentKey}${parentKey !== '' ? UNIQUE_SPLIT : ''}${item}`)];
        } else {
            Object.keys(node).forEach((key) => {
                const currentKey = `${parentKey}${parentKey !== '' ? UNIQUE_SPLIT : ''}${key}`;
                keys.push(currentKey);
                keys = [...keys, ...getAllChildKeys(node[key], currentKey)];
            });
        }

        return keys;
    };

    // Handles checking the parent and all children
    const handleCheck = (key, node, uniqueKey) => {
        const isChecked = !checkedItems[uniqueKey];
        if (node[key]) {
            const childKeys = getAllChildKeys(node[key], uniqueKey);

            setCheckedItems((prevChecked) => {
                const newChecked = { ...prevChecked, [uniqueKey]: isChecked };
                childKeys.forEach((childKey) => {
                    newChecked[childKey] = isChecked;
                });

                uncheckParentsIfNeeded(newChecked, uniqueKey);

                return newChecked;
            });
        } else {
            setCheckedItems((prevChecked) => {
                const newChecked = { ...prevChecked, [uniqueKey]: isChecked };
                uncheckParentsIfNeeded(newChecked, uniqueKey);

                return newChecked;
            });
        }
    };

    const getValueByPath = (obj, path) => {
        return path.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, obj);
    }

    const uncheckParentsIfNeeded = (checkedState, uniqueKey) => {
        const keys = uniqueKey.split(UNIQUE_SPLIT);

        for (let i = keys.length - 2; i >= 0; i--) {
            const ancestorPath = keys.slice(0, i + 1)
            const ancestorKey = ancestorPath.join(UNIQUE_SPLIT);
            const allChildren = getAllChildKeys(getValueByPath(data, ancestorPath), ancestorKey)
            checkedState[ancestorKey] = allChildren.every((childKey) => checkedState[childKey]);
        }
    };

    let count = 0


    const countCheckedItems = (node, parentKey = '') => {
        Object.keys(node).forEach((key) => {
            const uniqueKey = `${parentKey}${parentKey !== '' ? UNIQUE_SPLIT : ''}${key}`;
            if (Array.isArray(node[key])) {
                node[key].forEach((leaf) => {
                    const leafKey = `${uniqueKey}${UNIQUE_SPLIT}${leaf}`;
                    if (checkedItems[leafKey] === true) {
                        count++
                    }
                })
            } else {
                countCheckedItems(node[key], uniqueKey)
            }
        })
        return count
    }

    const handleMouseOverForTreeItem = (event, key) => {
        event.stopPropagation();
    
        tooltip.style("display", "block") 
            .transition()
            .duration(200)
            .style("opacity", 0.97);
    
        tooltip.html(`URI: ${key}</br>${
            key in metadata && metadata[key]["label"]?.length > 0 ? "Label: " + metadata[key]["label"] + "</br>" : ""
        }${
            key in metadata && metadata[key]["description"]?.length > 0 ? "Description: " + metadata[key]["description"] + "</br>" : ""
        }${
            key in metadata && metadata[key]["comment"]?.length > 0 ? "Comment: " + metadata[key]["comment"] + "</br>" : ""
        }`)
        .style("left", (event.pageX + 100) + "px")
        .style("top", (event.pageY - 28) + "px");
    };
    
    const handleMouseOut = () => {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0)
            .on("end", () => tooltip.style("display", "none"));
    };

    const renderTree = (node, parentKey = '') => {
        return Object.keys(node).map((key, index) => {
            const currentId = `${parentKey}${parentKey !== '' ? UNIQUE_SPLIT : ''}${key}${UNIQUE_SPLIT}${index}`;
            const uniqueKey = `${parentKey}${parentKey !== '' ? UNIQUE_SPLIT : ''}${key}`;

            if (Array.isArray(node[key])) {
                return (
                    <TreeItem
                        key={currentId}
                        itemId={currentId}
                        onMouseOver={(event) => handleMouseOverForTreeItem(event, key)}
                        onMouseOut={handleMouseOut}
                        label={
                            <>
                                <Checkbox
                                    checked={!!checkedItems[uniqueKey]}
                                    onChange={() => handleCheck(key, node, uniqueKey)}
                                    onClick={(e) => e.stopPropagation()}
                                    sx={checkBoxStyle}
                                    disableRipple
                                />
                                {depthLabels[1]}: {key in metadata && metadata[key]["label"]?.length > 0 ? metadata[key]["label"] : (key.includes('#') ? key.split('#').pop() : key)}
                            </>
                        }
                    >
                        {node[key].map((leaf, leafIndex) => {
                            const leafKey = `${uniqueKey}${UNIQUE_SPLIT}${leaf}`;
                            return (
                                <TreeItem
                                    key={`${leaf}-${leafIndex}`}
                                    itemId={`${leaf}-${leafIndex}-${Math.random()}`}
                                    onMouseOver={(event) => handleMouseOverForTreeItem(event, leaf)}
                                    onMouseOut={handleMouseOut}
                                    label={
                                        <div
                                            onClick={() => handleCheck(leaf, {}, leafKey)}
                                            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                        >
                                            <Checkbox
                                                checked={!!checkedItems[leafKey]}
                                                onChange={() => handleCheck(leaf, {}, leafKey)}
                                                onClick={(e) => e.stopPropagation()}
                                                sx={checkBoxStyle}
                                                disableRipple
                                            />
                                            {depthLabels[2]}: {leaf in metadata && metadata[leaf]["label"]?.length > 0
                                                ? metadata[leaf]["label"]
                                                : (leaf.includes('#') ? leaf.split('#').pop() : leaf)}
                                        </div>
                                    }
                                />
                            );
                        })}

                    </TreeItem>
                );
            } else {
                return (
                    <TreeItem
                        key={currentId}
                        itemId={currentId}
                        onMouseOver={(event) => handleMouseOverForTreeItem(event, key)}
                        onMouseOut={handleMouseOut}
                        label={
                            <>
                                <Checkbox
                                    checked={!!checkedItems[uniqueKey]}
                                    onChange={() => handleCheck(key, node, uniqueKey)}
                                    onClick={(e) => e.stopPropagation()}
                                    sx={checkBoxStyle}
                                    disableRipple
                                />
                                {depthLabels[0]}: {key in metadata && metadata[key]["label"]?.length > 0 ? metadata[key]["label"] : (key.includes('#') ? key.split('#').pop() : key)}
                            </>
                        }
                    >
                        {renderTree(node[key], uniqueKey)}
                    </TreeItem>
                );
            }
        });
    };

    const handleMouseOverForInfoIcon = (event) => {
        event.stopPropagation();
        const extraInfoHtml = ReactDOMServer.renderToStaticMarkup(extraInfo);
    
        tooltip.style("display", "block")
            .transition()
            .duration(200)
            .style("opacity", 0.97);
    
        tooltip.html(extraInfoHtml)
            .style("left", (event.pageX + 30) + "px")
            .style("top", (event.pageY - 28) + "px");
    };

    useEffect(() => {
        const getCheckedItemsFromCache = async () => {
            if ("caches" in window) {
                try {
                    const cache = await caches.open("checked_items");
                    const response = await cache.match("http://localhost:3000/");
                    if (response) {
                        const cacheData = await response.json();
                        setCheckedItems(cacheData || {});
                    }
                } catch (error) {
                    console.error("Failed to load cache", error);
                }
            }
        };

        getCheckedItemsFromCache().then(() => { });
    }, []);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return
        }

        const cacheData = new Response(JSON.stringify(checkedItems));
        const nonConflictTriplesPercentage = (consistency_data.all_triples_amount - countCheckedItems(data)) / consistency_data.all_triples_amount

        if ("caches" in window) {
            const saveToCache = async (cacheData, cacheName) => {
                try {
                    const cache = await caches.open(cacheName);
                    await cache.put("http://localhost:3000/", cacheData);
                } catch (error) {
                    console.error("Failed to save cache", error);
                }
            };

            saveToCache(cacheData, "checked_items").then(() => { });
            const consistencyScoreUpdated = ((consistency_data.consistency_score * consistency_data.consistency_components_amount + nonConflictTriplesPercentage) / (consistency_data.consistency_components_amount + 1)) * 100

            const storedConsistencyScore = localStorage.getItem('consistency_score_updated');

            if (storedConsistencyScore && parseFloat(storedConsistencyScore) !== consistencyScoreUpdated) {
                localStorage.setItem('consistency_score_updated', consistencyScoreUpdated + "");
                const consistencyUpdatedEvent = new CustomEvent('consistency_score_updated', {
                    detail: { consistencyScoreUpdated },
                });
                window.dispatchEvent(consistencyUpdatedEvent);
            } else {
                localStorage.setItem('consistency_score_updated', consistencyScoreUpdated + "");
            }
        }

        setNonConflictTriplesPercentage(nonConflictTriplesPercentage);
    }, [checkedItems]);

    return (
        <div className="checkbox_list_with_chart">
            <div className={"checkbox_list"}>
                <h1>
                    {listTitle}
                    <sup>
                        <InfoOutlinedIcon
                            onMouseOver={(event) => handleMouseOverForInfoIcon(event)}
                            onMouseOut={() => handleMouseOut()}
                            style={{ height: "20px", fontSize: "30px" }} />
                    </sup>
                </h1>
                <p>{listSubtitle}</p>
                <SimpleTreeView>
                    {renderTree(data)}
                </SimpleTreeView>
            </div>
            <DoughnutChartComp
                className={"doughnut-diagram"}
                value={nonConflictTriplesPercentage * 100}
                title={doughnutChartTitle} />
        </div>
    );
};

export default CollapsibleCheckboxList;
