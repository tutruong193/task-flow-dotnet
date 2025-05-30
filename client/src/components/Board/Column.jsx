import React from "react";
import Item from "./Item"; // Nhập component Item
import { Droppable } from "react-beautiful-dnd";
import { Button, Typography } from "antd";
import { FileExclamationOutlined } from "@ant-design/icons";
const { Text } = Typography;
const Column = ({ columnId, column, fetchAllData, options }) => {
  return (
    <Droppable droppableId={columnId}>
      {(provided, snapshot) => (
        <div className="column">
          <div className="column-header">
            <div className="column-title">
              <Text strong>{column.name.toUpperCase()}</Text>
              <Text className="column-count">{column.count}</Text>
              {column?.fileRequired && <FileExclamationOutlined />}
            </div>
          </div>
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="column-content"
            style={{
              backgroundColor: snapshot.isDraggingOver ? "#e6e6e6" : "#f0f0f0",
            }}
          >
            {column.items.map((item, index) => (
              <Item
                key={item.id}
                item={item}
                index={index}
                fetchAllData={fetchAllData}
                options={options}
              />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default Column;
