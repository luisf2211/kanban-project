"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  TextInput,
  Paper,
  Group,
  ActionIcon,
  Skeleton,
} from "@mantine/core";
import { IconTrash, IconPlus, IconDownload } from "@tabler/icons-react";

// ===================================
//  COMPONENTE PRINCIPAL
// ===================================
export default function ArchivosPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);

  // ===================================
  //  FETCH ARCHIVOS
  // ===================================
  const fetchFiles = async () => {
    setLoading(true);
    const res = await fetch("/api/upload");
    const data = await res.json();
    setFiles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // ===================================
  //  SUBIR ARCHIVO
  // ===================================
  const handleUpload = async () => {
    if (!selectedFile) return;

    const fd = new FormData();
    fd.append("file", selectedFile);
    fd.append("description", description);
    fd.append("name", name || selectedFile.name);

    setUploading(true);
    await fetch("/api/upload", {
      method: "POST",
      body: fd,
    });

    setUploading(false);
    setOpened(false);
    setSelectedFile(null);
    setName("");
    setDescription("");

    fetchFiles();
  };

  // ===================================
  //  ELIMINAR ARCHIVO
  // ===================================
  const handleDelete = async (id: string) => {
    setLoading(true);
    await fetch(`/api/upload/${id}`, { method: "DELETE" });
    fetchFiles();
  };

  // ===================================
  //  DESCARGAR ARCHIVO (URL FIRMADA)
  // ===================================
  const handleDownload = async (id: string) => {
    const res = await fetch(`/api/upload/${id}/download`);
    const data = await res.json();
    window.open(data.url, "_blank");
  };

  // ===================================
  //  RENDER
  // ===================================
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Archivos</h1>

        <Button
          leftSection={<IconPlus size={16} />}
          variant="gradient"
          gradient={{ from: "blue", to: "cyan" }}
          onClick={() => setOpened(true)}
        >
          Subir Archivo
        </Button>
      </div>

      {/* Card principal */}
      <Paper shadow="md" radius="lg" className="border overflow-hidden bg-white">
        {/* Encabezado */}
        <div className="border-b bg-gray-50 px-6 py-3">
          <h2 className="text-lg font-semibold text-gray-700">Listado de Archivos</h2>
        </div>

        {/* Grid de archivos */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? [...Array(6)].map((_, i) => <Skeleton key={i} height={80} />)
            : files.map((f) => (
                <Paper
                  key={f.id}
                  className="p-4 border rounded-lg hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{f.name}</p>
                    <p className="text-xs text-gray-500 uppercase">
                      {f.file_type}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(f.created_at).toLocaleString()}
                    </p>

                    {f.description && (
                      <p className="text-xs text-gray-600 mt-2 italic">
                        {f.description}
                      </p>
                    )}
                  </div>

                  <Group justify="space-between" mt="md">
                    <ActionIcon
                      color="blue"
                      variant="light"
                      radius="xl"
                      onClick={() => handleDownload(f.id)}
                    >
                      <IconDownload size={16} />
                    </ActionIcon>

                    <ActionIcon
                      color="red"
                      variant="light"
                      radius="xl"
                      onClick={() => handleDelete(f.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
        </div>
      </Paper>

      {/* MODAL SUBIR */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Subir Archivo"
        centered
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="Nombre"
            placeholder="Escribe un nombre opcional"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextInput
            label="Descripción"
            placeholder="Descripción opcional"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Área de selección */}
          <div
            className="border p-6 rounded-lg text-center cursor-pointer hover:bg-gray-50 transition"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            {selectedFile ? (
              <p className="text-green-600 font-medium">{selectedFile.name}</p>
            ) : (
              <p className="text-gray-500">Haz clic para seleccionar archivo</p>
            )}

            <input
              id="file-input"
              type="file"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>

          <Group justify="flex-end">
            <Button
              variant="gradient"
              gradient={{ from: "blue", to: "cyan" }}
              onClick={handleUpload}
              loading={uploading}
            >
              Subir
            </Button>
          </Group>
        </div>
      </Modal>
    </div>
  );
}
