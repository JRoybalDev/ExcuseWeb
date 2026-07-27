import {
  buildRequestEraTypeLabels,
  buildRequestEraTypeValues,
  buildRequestStatusLabels,
  buildRequestStatusValues,
  type BuildRequest,
  type BuildRequestEraType,
  type BuildRequestStatus
} from "@fullstack-template/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { apiClient } from "../../../shared/apiClient";
import { useDraftStore } from "../../../state/draftStore";
import { SelectDropdown } from "../../../shared/SelectDropdown";

type EraFilter = "all" | BuildRequestEraType;
type StatusFilter = "all" | BuildRequestStatus;
type SortOption = "newest" | "oldest" | "name";

const eraFilterOptions: { value: EraFilter; label: string }[] = [
  { value: "all", label: "All eras" },
  ...buildRequestEraTypeValues.map((value) => ({ value, label: buildRequestEraTypeLabels[value] }))
];

const statusFilterOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  ...buildRequestStatusValues.map((value) => ({ value, label: buildRequestStatusLabels[value] }))
];

const statusOptions = buildRequestStatusValues.map((value) => ({ value, label: buildRequestStatusLabels[value] }));

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A–Z" }
];

function statusTone(status: BuildRequestStatus): "accent" | "warn" | "ok" | "danger" {
  switch (status) {
    case "new":
      return "accent";
    case "reviewing":
      return "warn";
    case "declined":
      return "danger";
    default:
      return "ok";
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function BuildRequestsTab() {
  const queryClient = useQueryClient();
  const adminKey = useDraftStore((state) => state.adminKey);

  const requests = useQuery({
    queryKey: ["build-requests"],
    queryFn: () => apiClient.buildRequests.list(adminKey)
  });

  const [search, setSearch] = useState("");
  const [eraFilter, setEraFilter] = useState<EraFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [actionError, setActionError] = useState("");

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["build-requests"] });
  }

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BuildRequestStatus }) => apiClient.buildRequests.updateStatus(adminKey, id, status),
    onSuccess: () => {
      setActionError("");
      invalidate();
    },
    onError: (error: Error) => setActionError(error.message)
  });

  const deleteRequest = useMutation({
    mutationFn: (id: string) => apiClient.buildRequests.delete(adminKey, id),
    onSuccess: () => {
      setActionError("");
      invalidate();
    },
    onError: (error: Error) => setActionError(error.message)
  });

  const filtered = useMemo(() => {
    const rows = requests.data ?? [];
    const query = search.trim().toLowerCase();

    const matched = rows.filter((row) => {
      if (eraFilter !== "all" && row.eraType !== eraFilter) {
        return false;
      }

      if (statusFilter !== "all" && row.status !== statusFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        row.shoutoutName.toLowerCase().includes(query) ||
        row.buildIdea.toLowerCase().includes(query) ||
        row.specificMap.toLowerCase().includes(query) ||
        row.specificAdditions.toLowerCase().includes(query)
      );
    });

    const sorted = [...matched];

    if (sortBy === "newest") {
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (sortBy === "oldest") {
      sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    } else {
      sorted.sort((a, b) => a.shoutoutName.localeCompare(b.shoutoutName));
    }

    return sorted;
  }, [requests.data, search, eraFilter, statusFilter, sortBy]);

  const total = requests.data?.length ?? 0;

  return (
    <>
      <div className="admin-intro">
        <span className="admin-eyebrow">Construction Zone</span>
        <h1>Build requests</h1>
        <p>Everything fans have pitched through the public form — search, filter, and triage from here.</p>
      </div>

      <div className="build-requests-toolbar">
        <input
          className="build-requests-search"
          type="search"
          placeholder="Search name, idea, map…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <SelectDropdown value={eraFilter} options={eraFilterOptions} onChange={setEraFilter} />
        <SelectDropdown value={statusFilter} options={statusFilterOptions} onChange={setStatusFilter} />
        <SelectDropdown value={sortBy} options={sortOptions} onChange={setSortBy} />
      </div>

      {actionError ? <p className="admin-error">{actionError}</p> : null}

      {requests.isLoading ? <p className="build-requests-status">Loading...</p> : null}
      {requests.isError ? <p className="build-requests-status build-requests-status--error">Unable to load build requests.</p> : null}

      {!requests.isLoading && !requests.isError ? (
        total === 0 ? (
          <p className="build-requests-status">No build requests yet.</p>
        ) : filtered.length === 0 ? (
          <p className="build-requests-status">No requests match your filters.</p>
        ) : (
          <div className="build-requests-list">
            {filtered.map((request) => (
              <BuildRequestCard
                key={request.id}
                request={request}
                onChangeStatus={(status) => updateStatus.mutate({ id: request.id, status })}
                onDelete={() => deleteRequest.mutate(request.id)}
              />
            ))}
          </div>
        )
      ) : null}
    </>
  );
}

function BuildRequestCard({
  request,
  onChangeStatus,
  onDelete
}: {
  request: BuildRequest;
  onChangeStatus: (status: BuildRequestStatus) => void;
  onDelete: () => void;
}) {
  return (
    <article className="build-request-item">
      <div className="build-request-item__header">
        <div className="build-request-item__title">
          <span className="build-request-item__name">{request.shoutoutName}</span>
          <span className={`admin-status-pill admin-status-pill--${statusTone(request.status)}`}>
            <span className="admin-status-pill__dot" />
            {buildRequestStatusLabels[request.status]}
          </span>
          <span className="build-request-item__tag">{buildRequestEraTypeLabels[request.eraType]}</span>
        </div>
        <div className="build-request-item__actions">
          <SelectDropdown value={request.status} options={statusOptions} onChange={onChangeStatus} />
          <button className="build-request-item__delete" type="button" aria-label="Delete request" onClick={onDelete}>
            <FiTrash2 aria-hidden />
          </button>
        </div>
      </div>
      <span className="build-request-item__date">Submitted {formatDate(request.createdAt)}</span>
      <p className="build-request-item__idea">{request.buildIdea}</p>
      {request.specificMap ? (
        <p className="build-request-item__detail">
          <strong>Map:</strong> {request.specificMap}
        </p>
      ) : null}
      {request.specificAdditions ? (
        <p className="build-request-item__detail">
          <strong>Must-haves:</strong> {request.specificAdditions}
        </p>
      ) : null}
      {request.imageUrl ? (
        <a className="build-request-item__thumb" href={request.imageUrl} target="_blank" rel="noreferrer">
          <img src={request.imageUrl} alt="Reference screenshot" />
        </a>
      ) : null}
    </article>
  );
}
