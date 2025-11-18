"use client";

import React, { useEffect, useState } from "react";
import {
    Paper,
    Button,
    Modal,
    TextInput,
    Textarea,
    Select,
    Group,
    ActionIcon,
    Loader,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useForm } from "@mantine/form";

// ⬇️ DRAG & DROP
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "@hello-pangea/dnd";

// =========================
// MAPEO DE ESTADOS
// =========================

const STATUS_MAP = {
    todo: "Backlog",
    in_progress: "En Progreso",
    review: "En Revisión",
    done: "Completado",
};

const REVERSE_STATUS_MAP = {
    Backlog: "todo",
    "En Progreso": "in_progress",
    "En Revisión": "review",
    Completado: "done",
};

const PRIORITIES = ["low", "medium", "high", "urgent"];
const COLUMNS = ["Backlog", "En Progreso", "En Revisión", "Completado"];

// =========================
// PAGE
// =========================

export default function ProyectosPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [opened, setOpened] = useState(false);
    const [creating, setCreating] = useState(false);

    const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

    // FORM
    const form = useForm({
        initialValues: {
            name: "",
            description: "",
            status: "todo",
            priority: "medium",
        },
    });

    // FETCH PROJECTS
    const fetchProjects = async () => {
        setLoading(true);
        const res = await fetch("/api/projects");
        const json = await res.json();
        setProjects(json);
        setLoading(false);
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // CREATE PROJECT
    const createProject = async () => {
        const validation = form.validate();
        if (validation.hasErrors) return;

        setCreating(true);

        await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form.values),
        });

        form.reset();
        setCreating(false);
        setOpened(false);
        fetchProjects();
    };

    // DELETE PROJECT
    const deleteProject = async (id: string) => {
        setLoadingDeleteId(id);

        await fetch(`/api/projects/${id}`, { method: "DELETE" });

        setTimeout(() => {
            setLoadingDeleteId(null);
            fetchProjects();
        }, 600);
    };

    // DRAG & DROP HANDLER
    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const { draggableId, destination } = result;

        const newStatus = REVERSE_STATUS_MAP[destination.droppableId];

        setUpdatingStatusId(draggableId);

        await fetch(`/api/projects/${draggableId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });

        setUpdatingStatusId(null);
        fetchProjects();
    };

    return (
        <div className="p-6 w-full">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-semibold">Proyectos</h1>

                <Button
                    leftSection={<IconPlus size={16} />}
                    variant="gradient"
                    gradient={{ from: "blue", to: "cyan" }}
                    onClick={() => setOpened(true)}
                >
                    Nuevo Proyecto
                </Button>
            </div>

            {/* ============================
          KANBAN + DRAG & DROP
      ============================ */}

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-4 gap-4">
                    {COLUMNS.map((col) => (
                        <Droppable droppableId={col} key={col}>
                            {(provided) => (
                                <Paper
                                    shadow="md"
                                    radius="lg"
                                    className="border border-gray-200 bg-white flex flex-col h-[80vh]"
                                >
                                    <div className="border-b bg-gray-50 px-4 py-3">
                                        <h2 className="text-lg font-semibold text-gray-700">{col}</h2>
                                    </div>

                                    <div
                                        className="flex-1 overflow-y-auto p-3 space-y-3"
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {projects
                                            .filter((p) => STATUS_MAP[p.status] === col)
                                            .map((p, index) => (
                                                <Draggable key={p.id} draggableId={p.id} index={index}>
                                                    {(provided) => (
                                                        <Paper
                                                            shadow="sm"
                                                            className={`p-3 rounded-lg border bg-white transition ${updatingStatusId === p.id ? "opacity-40" : ""
                                                                }`}
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <div className="flex justify-between mb-2">
                                                                <h4 className="font-semibold">{p.name}</h4>

                                                                <ActionIcon
                                                                    color="red"
                                                                    variant="light"
                                                                    radius="xl"
                                                                    onClick={() => deleteProject(p.id)}
                                                                >
                                                                    {loadingDeleteId === p.id ? (
                                                                        <Loader size="xs" />
                                                                    ) : (
                                                                        <IconTrash size={16} />
                                                                    )}
                                                                </ActionIcon>
                                                            </div>

                                                            <p className="text-sm text-gray-500">{p.description}</p>

                                                            <div className="mt-3 text-xs flex justify-between text-gray-600">
                                                                <span>Prioridad: {p.priority}</span>
                                                                <span>{new Date(p.created_at).toLocaleString()}</span>
                                                            </div>
                                                        </Paper>
                                                    )}
                                                </Draggable>
                                            ))}

                                        {provided.placeholder}
                                    </div>
                                </Paper>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>

            {/* ============================
          MODAL CREATE PROJECT
      ============================ */}
            <Modal opened={opened} onClose={() => setOpened(false)} title="Nuevo Proyecto" centered>
                <form onSubmit={form.onSubmit(createProject)} className="space-y-4">
                    <TextInput label="Nombre" {...form.getInputProps("name")} />

                    <Textarea label="Descripción" minRows={3} {...form.getInputProps("description")} />

                    <Select
                        label="Estatus"
                        data={Object.entries(STATUS_MAP).map(([key, label]) => ({
                            value: key,
                            label,
                        }))}
                        {...form.getInputProps("status")}
                    />

                    <Select
                        label="Prioridad"
                        data={PRIORITIES.map((p) => ({ value: p, label: p }))}
                        {...form.getInputProps("priority")}
                    />

                    <Group justify="right">
                        <Button
                            type="submit"
                            loading={creating}
                            variant="gradient"
                            gradient={{ from: "blue", to: "cyan" }}
                        >
                            Guardar
                        </Button>
                    </Group>
                </form>
            </Modal>
        </div>
    );
}
