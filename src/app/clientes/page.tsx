"use client";

import React, { useState, useEffect } from "react";
import {
    Table,
    Button,
    Select,
    TextInput,
    Modal,
    NumberInput,
    Pagination,
    Group,
    ActionIcon,
    Badge,
    Paper,
    Skeleton,
} from "@mantine/core";

import {
    IconTrash,
    IconPlus,
    IconCheck,
    IconX,
    IconPencil,
} from "@tabler/icons-react";

import { z } from "zod";
import { useForm, zodResolver } from "@mantine/form";

// ========================================================
// VALIDATION
// ========================================================

const schema = z.object({
    name: z.string().min(2, "Ingresa un nombre válido"),
    type: z.enum(["Persona", "Compañía"]),
    value: z.number().min(1, "Valor inválido"),
    date_from: z.string().min(1, "Fecha requerida"),
    date_to: z.string().min(1, "Fecha requerida"),
});

type ClienteForm = z.infer<typeof schema>;

interface Cliente {
    id: string;
    name: string;
    type: "Persona" | "Compañía";
    value: number;
    date_from: string;
    date_to: string;
}

export default function ClientesPage() {
    const [clients, setClients] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingRow, setEditingRow] = useState<string | null>(null);
    const [editCache, setEditCache] = useState<Partial<Cliente>>({});
    const [loadingRow, setLoadingRow] = useState<string | null>(null);

    const [opened, setOpened] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const pageSize = 10;
    const [page, setPage] = useState(1);

    const form = useForm<ClienteForm>({
        initialValues: {
            name: "",
            type: "Persona",
            value: 0,
            date_from: "",
            date_to: "",
        },

        validate: (values) => {
            const result = schema.safeParse(values);

            if (result.success) return {};

            return result.error.flatten().fieldErrors;
        },
    });


    // ========================================================
    // FETCH CLIENTS
    // ========================================================

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/clients");
            const json = await res.json();
            setClients(Array.isArray(json) ? json : []);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const paginatedData = clients.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(clients.length / pageSize);

    // ========================================================
    // CREATE CLIENT
    // ========================================================

    const handleCreate = async () => {
        const validation = form.validate();
        if (validation.hasErrors) return;

        setIsCreating(true);

        try {
            const res = await fetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form.values),
            });

            if (res.ok) {
                await fetchClients();
                form.reset();
                setOpened(false);
            }
        } finally {
            setIsCreating(false);
        }
    };

    // ========================================================
    // DELETE CLIENT
    // ========================================================

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            await fetch(`/api/clients/${id}`, { method: "DELETE" });
            await fetchClients();
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    // ========================================================
    // INLINE EDIT WITH BUTTON
    // ========================================================

    const startEditing = (cliente: Cliente) => {
        setEditingRow(cliente.id);
        setEditCache({ ...cliente });
    };

    const cancelEditing = () => {
        setEditingRow(null);
        setEditCache({});
    };

    const saveInlineUpdate = async (id: string) => {
        setLoadingRow(id);
        const updated = editCache;

        setClients((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
        );

        await fetch(`/api/clients/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: updated.name,
                type: updated.type,
                value: Number(updated.value),
                date_from: updated.date_from,
                date_to: updated.date_to,
            }),
        });

        setEditingRow(null);

        setTimeout(() => {
            setLoadingRow(null);
        }, 600);
    };

    const SkeletonRows = () =>
        [...Array(5)].map((_, i) => (
            <tr key={i}>
                {[...Array(6)].map((__, j) => (
                    <td key={j} className="py-4 px-6">
                        <Skeleton height={18} />
                    </td>
                ))}
            </tr>
        ));

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="p-6 w-full">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-semibold">Clientes</h1>

                <Button
                    leftSection={<IconPlus size={16} />}
                    variant="gradient"
                    gradient={{ from: "blue", to: "cyan" }}
                    onClick={() => {
                        form.reset();
                        setOpened(true);
                    }}
                >
                    Nuevo Cliente
                </Button>
            </div>

            <Paper shadow="md" radius="lg" className="border overflow-hidden bg-white">
                <div className="border-b bg-gray-50 px-6 py-3">
                    <h2 className="text-lg font-semibold text-gray-700">
                        Listado de Clientes
                    </h2>
                </div>

                <Table verticalSpacing="sm" highlightOnHover>
                    <thead className="bg-gray-100 border-b">
                        <tr className="text-left text-gray-600 text-sm uppercase tracking-wide">
                            <th className="py-3 px-6">Nombre</th>
                            <th className="py-3 px-6">Tipo</th>
                            <th className="py-3 px-6">Valor</th>
                            <th className="py-3 px-6">Desde</th>
                            <th className="py-3 px-6">Hasta</th>
                            <th className="py-3 px-6 text-center">Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <SkeletonRows />
                        ) : (
                            paginatedData.map((c) => (
                                <tr
                                    key={c.id}
                                    className={`transition-all ${loadingRow === c.id ? "opacity-30" : "hover:bg-gray-50"
                                        }`}
                                >
                                    {/* NAME */}
                                    <td className="py-3 px-6">
                                        {editingRow === c.id ? (
                                            <TextInput
                                                size="xs"
                                                value={editCache.name}
                                                onChange={(e) =>
                                                    setEditCache((p) => ({
                                                        ...p,
                                                        name: e.target.value,
                                                    }))
                                                }
                                            />
                                        ) : (
                                            <span className="font-medium text-gray-800">
                                                {c.name}
                                            </span>
                                        )}
                                    </td>

                                    {/* TYPE */}
                                    <td className="py-3 px-6">
                                        {editingRow === c.id ? (
                                            <Select
                                                size="xs"
                                                data={["Persona", "Compañía"]}
                                                value={editCache.type}
                                                onChange={(v) =>
                                                    setEditCache((p) => ({ ...p, type: v }))
                                                }
                                            />
                                        ) : (
                                            <Badge
                                                color={c.type === "Persona" ? "blue" : "grape"}
                                                variant="light"
                                            >
                                                {c.type}
                                            </Badge>
                                        )}
                                    </td>

                                    {/* VALUE */}
                                    <td className="py-3 px-6">
                                        {editingRow === c.id ? (
                                            <NumberInput
                                                size="xs"
                                                value={editCache.value}
                                                thousandSeparator=","
                                                prefix="RD$ "
                                                onChange={(v) =>
                                                    setEditCache((p) => ({ ...p, value: Number(v) }))
                                                }
                                            />
                                        ) : (
                                            <span className="font-semibold text-gray-800">
                                                RD$ {c.value.toLocaleString()}
                                            </span>
                                        )}
                                    </td>

                                    <td className="py-3 px-6">{c.date_from}</td>
                                    <td className="py-3 px-6">{c.date_to}</td>

                                    {/* ACTIONS */}
                                    <td className="py-3 px-6 text-center flex justify-center gap-2">
                                        {editingRow === c.id ? (
                                            <>
                                                <ActionIcon
                                                    color="green"
                                                    variant="light"
                                                    radius="xl"
                                                    onClick={() => saveInlineUpdate(c.id)}
                                                >
                                                    <IconCheck size={16} />
                                                </ActionIcon>

                                                <ActionIcon
                                                    color="gray"
                                                    variant="light"
                                                    radius="xl"
                                                    onClick={cancelEditing}
                                                >
                                                    <IconX size={16} />
                                                </ActionIcon>
                                            </>
                                        ) : (
                                            <>
                                                <ActionIcon
                                                    color="blue"
                                                    variant="light"
                                                    radius="xl"
                                                    onClick={() => startEditing(c)}
                                                >
                                                    <IconPencil size={16} />
                                                </ActionIcon>

                                                <ActionIcon
                                                    color="red"
                                                    variant="light"
                                                    radius="xl"
                                                    onClick={() => handleDelete(c.id)}
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Paper>

            {!loading && (
                <Group justify="center" mt="lg">
                    <Pagination total={totalPages} page={page} onChange={setPage} />
                </Group>
            )}

            {/* MODAL CREATE */}
            <Modal opened={opened} onClose={() => setOpened(false)} title="Crear Cliente" centered>
                <form onSubmit={form.onSubmit(handleCreate)} className="space-y-4">
                    <TextInput label="Nombre" {...form.getInputProps("name")} />

                    <Select
                        label="Tipo"
                        data={["Persona", "Compañía"]}
                        {...form.getInputProps("type")}
                    />

                    <NumberInput
                        label="Valor (DOP)"
                        prefix="RD$ "
                        thousandSeparator=","
                        {...form.getInputProps("value")}
                    />

                    <TextInput label="Desde" type="date" {...form.getInputProps("date_from")} />

                    <TextInput label="Hasta" type="date" {...form.getInputProps("date_to")} />

                    <Group justify="right">
                        <Button
                            type="submit"
                            loading={isCreating}
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
