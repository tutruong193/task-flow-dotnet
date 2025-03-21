import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Modal, Button, Typography, Input, Space } from "antd";
import {
  MenuOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import * as ColumnService from "../../services/ColumnService";
import * as Message from "../../components/MessageComponent/MessageComponent";

const { Text } = Typography;

const ModalReorderColumn = ({ columns, setColumns, fetchAllData }) => {
  const projectId = localStorage.getItem("projectId");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reorderColumn, setReorderColumn] = useState([]);
  const [editColumnId, setEditColumnId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const showModal = () => {
    setIsModalVisible(true);
    setReorderColumn(columns);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setReorderColumn([...columns]);
    setEditColumnId(null);
    setEditedName("");
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedColumns = Array.from(reorderColumn);
    const [movedColumn] = reorderedColumns.splice(result.source.index, 1);
    reorderedColumns.splice(result.destination.index, 0, movedColumn);
    const updatedColumns = reorderedColumns.map((col, index) => ({
      ...col,
      position: index + 1,
    }));
    setReorderColumn(updatedColumns);
  };

  const handleSave = async () => {
    try {
      const res = await ColumnService.updatedColumns(projectId, reorderColumn);
      if (res.status == 200 || res.status == 201) {
        Message.success();
        fetchAllData();
        setIsModalVisible(false);
      } else {
        Message.error(res.message);
      }
    } catch (error) {
      console.error("Error updating column positions:", error);
      Message.error("Failed to update column positions.");
    }
  };

  const handleEdit = (col) => {
    setEditColumnId(col.id);
    setEditedName(col.name);
  };

  const handleSaveEdit = () => {
    setReorderColumn(
      reorderColumn?.map((col) =>
        col.id === editColumnId ? { ...col, name: editedName } : col
      )
    );
    setEditColumnId(null);
    setEditedName("");
  };

  const handleCancelEdit = () => {
    setEditColumnId(null);
    setEditedName("");
  };

  const handleDelete = (colId) => {
    setReorderColumn(reorderColumn.filter((col) => col.id !== colId));
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Reorder Columns
      </Button>
      <Modal
        title="Reorder Columns"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSave}>
            Save
          </Button>,
        ]}
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="columns">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {reorderColumn?.map((col, index) => (
                  <Draggable key={col.id} draggableId={col.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          padding: "8px",
                          marginBottom: "8px",
                          border: "1px solid #d9d9d9",
                          borderRadius: "4px",
                          backgroundColor: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          ...provided.draggableProps.style,
                        }}
                      >
                        <Space>
                          <MenuOutlined style={{ cursor: "grab" }} />
                          {editColumnId === col.id ? (
                            <Input
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              size="small"
                              style={{ width: "150px" }}
                            />
                          ) : (
                            <Text>{col.name.toUpperCase()}</Text>
                          )}
                        </Space>

                        <Space>
                          {editColumnId === col.id ? (
                            <>
                              <Button
                                icon={<CheckOutlined />}
                                type="primary"
                                size="small"
                                onClick={handleSaveEdit}
                              />
                              <Button
                                icon={<CloseOutlined />}
                                size="small"
                                onClick={handleCancelEdit}
                              />
                            </>
                          ) : (
                            <>
                              <Button
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => handleEdit(col)}
                                disabled={[
                                  "to do",
                                  "in progress",
                                  "done",
                                ].includes(col.name.toLowerCase())}
                              />
                              <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                                onClick={() => handleDelete(col.id)}
                                disabled={[
                                  "to do",
                                  "in progress",
                                  "done",
                                ].includes(col.name.toLowerCase())}
                              />
                            </>
                          )}
                        </Space>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Modal>
    </>
  );
};

export default ModalReorderColumn;
