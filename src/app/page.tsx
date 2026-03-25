"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  ZOHO_PRODUCTS,
  ZOHO_DOMAINS,
  SCOPE_TYPE_COLORS,
  type ZohoScope,
  type ZohoProduct,
  type ScopeType,
} from "@/lib/zoho-scopes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { GlowCard } from "@/components/ui/spotlight-card";

const PRODUCT_GLOW_MAP: Record<string, "blue" | "purple" | "green" | "red" | "orange"> = {
  books: "green",
  cliq: "orange",
  analytics: "purple",
  mail: "blue",
  salesiq: "orange",
  crm: "red",
  desk: "blue",
  people: "green",
  projects: "purple",
  inventory: "orange",
  creator: "purple",
  sign: "blue",
  subscriptions: "green",
  recruit: "green",
  campaigns: "red",
  workdrive: "blue",
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState(ZOHO_DOMAINS[0].value);
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set());
  const [editingScope, setEditingScope] = useState<{
    product: ZohoProduct;
    scope: ZohoScope;
  } | null>(null);
  const [customScopes, setCustomScopes] = useState<
    Record<string, Partial<ZohoScope>>
  >({});
  const [editForm, setEditForm] = useState({ description: "", useCase: "" });
  const [filterType, setFilterType] = useState<ScopeType | "ALL_TYPES">(
    "ALL_TYPES"
  );
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const getScope = useCallback(
    (scope: ZohoScope): ZohoScope => {
      const custom = customScopes[scope.id];
      if (!custom) return scope;
      return { ...scope, ...custom };
    },
    [customScopes]
  );

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return ZOHO_PRODUCTS.map((product) => {
      const matchingScopes = product.scopes.filter((s) => {
        const scope = getScope(s);
        const matchesSearch =
          !q ||
          scope.scope.toLowerCase().includes(q) ||
          scope.description.toLowerCase().includes(q) ||
          scope.useCase.toLowerCase().includes(q) ||
          product.name.toLowerCase().includes(q);
        const matchesType =
          filterType === "ALL_TYPES" || scope.type === filterType;
        return matchesSearch && matchesType;
      });
      return { ...product, scopes: matchingScopes };
    }).filter((p) => p.scopes.length > 0);
  }, [search, filterType, getScope]);

  const toggleScope = (scopeString: string) => {
    setSelectedScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scopeString)) {
        next.delete(scopeString);
      } else {
        next.add(scopeString);
      }
      return next;
    });
  };

  const selectAllInProduct = (product: ZohoProduct) => {
    setSelectedScopes((prev) => {
      const next = new Set(prev);
      product.scopes.forEach((s) => next.add(getScope(s).scope));
      return next;
    });
  };

  const deselectAllInProduct = (product: ZohoProduct) => {
    setSelectedScopes((prev) => {
      const next = new Set(prev);
      product.scopes.forEach((s) => next.delete(getScope(s).scope));
      return next;
    });
  };

  const allScopesSelected = (product: ZohoProduct) =>
    product.scopes.every((s) => selectedScopes.has(getScope(s).scope));

  const openEdit = (product: ZohoProduct, scope: ZohoScope) => {
    const s = getScope(scope);
    setEditForm({ description: s.description, useCase: s.useCase });
    setEditingScope({ product, scope });
  };

  const saveEdit = () => {
    if (!editingScope) return;
    setCustomScopes((prev) => ({
      ...prev,
      [editingScope.scope.id]: {
        description: editForm.description,
        useCase: editForm.useCase,
      },
    }));
    setEditingScope(null);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const selectedScopesString = Array.from(selectedScopes).join(",");

  const scopeUrl = selectedScopes.size
    ? `${selectedDomain}/oauth/v2/auth?scope=${encodeURIComponent(selectedScopesString)}&client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_REDIRECT_URI&access_type=offline`
    : "";

  return (
    <div className="relative min-h-screen bg-[#faf9f7] overflow-hidden">
      {/* Soft pastel blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] rounded-full bg-pink-200/30 blur-3xl" />
        <div className="absolute top-2/3 right-1/4 w-[400px] h-[400px] rounded-full bg-green-200/25 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Dentalkart"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Zoho Token Scopes
              </h1>
              <p className="text-xs text-muted-foreground">by Dentalkart</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {selectedScopes.size > 0 && (
              <Badge variant="secondary" className="font-mono text-xs">
                {selectedScopes.size} scope{selectedScopes.size !== 1 && "s"}{" "}
                selected
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Domain Selector + Search + Filter */}
        <div className="mb-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Zoho Domain
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ZOHO_DOMAINS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label} - {d.value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Search Scopes
              </label>
              <Input
                type="search"
                placeholder="Search by scope name, description, or use case..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as ScopeType | "ALL_TYPES")
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="ALL_TYPES">All Types</option>
                <option value="READ">READ</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="ALL">ALL</option>
                <option value="FULL">FULL ACCESS</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground mr-1 self-center">
              Scope Types:
            </span>
            {(
              Object.entries(SCOPE_TYPE_COLORS) as [ScopeType, string][]
            ).map(([type, colors]) => (
              <Badge
                key={type}
                variant="outline"
                className={`text-xs ${colors}`}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Selected Scopes Output */}
        {selectedScopes.size > 0 && (
          <Card className="mb-6 border-emerald-300 bg-emerald-50/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Selected Scopes ({selectedScopes.size})
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selectedScopesString)}
                  >
                    {copiedText === selectedScopesString
                      ? "Copied!"
                      : "Copy Scopes"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(scopeUrl)}
                  >
                    {copiedText === scopeUrl ? "Copied!" : "Copy Auth URL"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setSelectedScopes(new Set())}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {Array.from(selectedScopes).map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="cursor-pointer font-mono text-xs hover:bg-destructive/20 hover:text-destructive"
                    onClick={() => toggleScope(s)}
                    title="Click to remove"
                  >
                    {s} &times;
                  </Badge>
                ))}
              </div>
              <div className="rounded-md bg-muted/50 p-3">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Scope String (comma-separated):
                </p>
                <code className="block break-all font-mono text-xs text-foreground">
                  {selectedScopesString}
                </code>
              </div>
              <div className="mt-3 rounded-md bg-muted/50 p-3">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  OAuth Authorization URL:
                </p>
                <code className="block break-all font-mono text-xs text-foreground">
                  {scopeUrl}
                </code>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Sections */}
        <Accordion multiple className="space-y-3">
          {filteredProducts.map((product) => (
            <AccordionItem
              key={product.id}
              className="rounded-lg border border-gray-200 bg-white/60 backdrop-blur-sm shadow-sm"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex w-full items-center justify-between pr-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-lg font-bold ${product.color}`}
                    >
                      {product.name.replace("Zoho ", "").charAt(0)}
                    </div>
                    <div className="text-left">
                      <span className="font-semibold">{product.name}</span>
                      <p className="text-xs text-muted-foreground">
                        {product.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mr-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {product.scopes.length} scopes
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-3">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Select all scopes in {product.name}
                  </span>
                  <Switch
                    checked={allScopesSelected(product)}
                    onCheckedChange={(checked) =>
                      checked
                        ? selectAllInProduct(product)
                        : deselectAllInProduct(product)
                    }
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {product.scopes.map((rawScope) => {
                    const scope = getScope(rawScope);
                    const isSelected = selectedScopes.has(scope.scope);
                    return (
                      <GlowCard
                        key={scope.id}
                        glowColor={PRODUCT_GLOW_MAP[product.id] || "blue"}
                        className={`group p-3 transition-all ${
                          isSelected
                            ? "ring-1 ring-primary/40"
                            : ""
                        }`}
                      >
                        <div className="relative z-10">
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={isSelected}
                                onCheckedChange={() =>
                                  toggleScope(scope.scope)
                                }
                                className="scale-75"
                              />
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${SCOPE_TYPE_COLORS[scope.type]}`}
                              >
                                {scope.type}
                              </Badge>
                            </div>
                            <button
                              onClick={() => openEdit(product, rawScope)}
                              className="text-xs text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                              title="Edit scope details"
                            >
                              Edit
                            </button>
                          </div>
                          <button
                            onClick={() => toggleScope(scope.scope)}
                            className="w-full text-left"
                          >
                            <p className="mb-1 font-mono text-xs font-medium text-foreground break-all">
                              {scope.scope}
                            </p>
                            <p className="text-xs font-medium text-muted-foreground">
                              {scope.description}
                            </p>
                            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground/70">
                              {scope.useCase}
                            </p>
                          </button>
                          <button
                            onClick={() => copyToClipboard(scope.scope)}
                            className="mt-2 text-[10px] text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                          >
                            {copiedText === scope.scope
                              ? "Copied!"
                              : "Copy scope"}
                          </button>
                        </div>
                      </GlowCard>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {filteredProducts.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">
              No scopes found matching your search.
            </p>
            <p className="mt-1 text-sm text-muted-foreground/60">
              Try a different search term or clear the filters.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-border py-6 text-center">
          <p className="text-xs text-muted-foreground">
            Zoho Token Scopes - Built for Dentalkart | Domain:{" "}
            <span className="font-mono">{selectedDomain}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Use these scopes when generating refresh tokens via Zoho OAuth 2.0
          </p>
        </footer>
      </main>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingScope}
        onOpenChange={(open) => !open && setEditingScope(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Scope Details</DialogTitle>
          </DialogHeader>
          {editingScope && (
            <div className="space-y-4 py-2">
              <div>
                <p className="mb-2 font-mono text-sm font-medium">
                  {getScope(editingScope.scope).scope}
                </p>
                <Badge
                  variant="outline"
                  className={`text-xs ${SCOPE_TYPE_COLORS[getScope(editingScope.scope).type]}`}
                >
                  {getScope(editingScope.scope).type}
                </Badge>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>
                <Input
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Use Case
                </label>
                <Textarea
                  value={editForm.useCase}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      useCase: e.target.value,
                    }))
                  }
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingScope(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
