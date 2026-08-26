import {
  AuditRunListSchema,
  AuditRunSchema,
  BuildRequestListSchema,
  BuildRequestSchema,
  CalendarAutoFillResultSchema,
  CalendarChecklistSchema,
  CalendarEntryListSchema,
  CalendarEntrySchema,
  ChecklistItemListSchema,
  ChecklistItemSchema,
  ScheduleEntryListSchema,
  ScheduleEntrySchema,
  SiteListSchema,
  SiteSchema,
  UploadListSchema,
  UploadSchema,
  WeeklyRhythmStateSchema,
  type AuditRunDraftInput,
  type BuildRequestDraftInput,
  type BuildRequestStatus,
  type CalendarAutoFillInput,
  type CalendarChecklistUpdateInput,
  type CalendarEntryDraftInput,
  type ChecklistItemDraftInput,
  type ChecklistItemUpdateInput,
  type ScheduleEntryDraftInput,
  type SiteDraft,
  type WeeklyRhythmUpdateInput
} from "@fullstack-template/schema";
import { apiJson, withAdminKey } from "./api";
import { downscaleImageIfNeeded } from "./imageResize";

export type YouTubeVideo = {
  id: string;
  title: string;
  thumbnailUrl: string;
  url: string;
};

export type AuthConfig = {
  authMode: "admin-key" | "better-auth";
  signupMode: "private" | "public";
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | string;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateAdminUserInput = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
};

export type UpdateAdminUserRoleInput = {
  role: "admin" | "user";
};

export type BanAdminUserInput = {
  banReason?: string;
  banExpiresIn?: number;
};

export type SetAdminUserPasswordInput = {
  newPassword: string;
};

export const apiClient = {
  auth: {
    async config() {
      return (await apiJson("/api/auth/config")) as AuthConfig;
    },

    async requestPasswordReset(email: string, redirectTo: string) {
      return apiJson("/api/auth/request-password-reset", {
        method: "POST",
        body: JSON.stringify({ email, redirectTo })
      });
    },

    async resetPassword(token: string, newPassword: string) {
      return apiJson("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword })
      });
    }
  },

  sites: {
    async listPublic() {
      return SiteListSchema.parse(await apiJson("/api/sites"));
    },

    async getPublic(slug: string) {
      return SiteSchema.parse(await apiJson(`/api/sites/${encodeURIComponent(slug)}`));
    }
  },

  admin: {
    async verifySession(adminKey: string) {
      return apiJson("/api/admin/session", withAdminKey(adminKey));
    },

    async listSites(adminKey: string) {
      return SiteListSchema.parse(await apiJson("/api/admin/sites", withAdminKey(adminKey)));
    },

    async listUsers(adminKey: string) {
      return (await apiJson("/api/admin/users", withAdminKey(adminKey))) as AdminUser[];
    },

    async createUser(adminKey: string, input: CreateAdminUserInput) {
      return apiJson(
        "/api/admin/users",
        withAdminKey(adminKey, {
          method: "POST",
          body: JSON.stringify(input)
        })
      );
    },

    async updateUserRole(adminKey: string, userId: string, input: UpdateAdminUserRoleInput) {
      return apiJson(
        `/api/admin/users/${encodeURIComponent(userId)}/role`,
        withAdminKey(adminKey, {
          method: "POST",
          body: JSON.stringify(input)
        })
      );
    },

    async banUser(adminKey: string, userId: string, input: BanAdminUserInput) {
      return apiJson(
        `/api/admin/users/${encodeURIComponent(userId)}/ban`,
        withAdminKey(adminKey, {
          method: "POST",
          body: JSON.stringify(input)
        })
      );
    },

    async unbanUser(adminKey: string, userId: string) {
      return apiJson(
        `/api/admin/users/${encodeURIComponent(userId)}/unban`,
        withAdminKey(adminKey, {
          method: "POST"
        })
      );
    },

    async setUserPassword(adminKey: string, userId: string, input: SetAdminUserPasswordInput) {
      return apiJson(
        `/api/admin/users/${encodeURIComponent(userId)}/password`,
        withAdminKey(adminKey, {
          method: "POST",
          body: JSON.stringify(input)
        })
      );
    },

    async revokeUserSessions(adminKey: string, userId: string) {
      return apiJson(
        `/api/admin/users/${encodeURIComponent(userId)}/revoke-sessions`,
        withAdminKey(adminKey, {
          method: "POST"
        })
      );
    },

    async deleteUser(adminKey: string, userId: string) {
      return apiJson(
        `/api/admin/users/${encodeURIComponent(userId)}`,
        withAdminKey(adminKey, {
          method: "DELETE"
        })
      );
    },

    async saveSite(adminKey: string, draft: SiteDraft) {
      return SiteSchema.parse(
        await apiJson(
          "/api/sites",
          withAdminKey(adminKey, {
            method: "POST",
            body: JSON.stringify(draft)
          })
        )
      );
    },

    async deleteSite(adminKey: string, slug: string) {
      return SiteSchema.parse(
        await apiJson(
          `/api/sites/${encodeURIComponent(slug)}`,
          withAdminKey(adminKey, {
            method: "DELETE"
          })
        )
      );
    }
  },

  schedule: {
    async list() {
      return ScheduleEntryListSchema.parse(await apiJson("/api/schedule"));
    },

    async create(adminKey: string, draft: ScheduleEntryDraftInput) {
      return ScheduleEntrySchema.parse(
        await apiJson(
          "/api/schedule",
          withAdminKey(adminKey, {
            method: "POST",
            body: JSON.stringify(draft)
          })
        )
      );
    },

    async update(adminKey: string, id: string, draft: ScheduleEntryDraftInput) {
      return ScheduleEntrySchema.parse(
        await apiJson(
          `/api/schedule/${encodeURIComponent(id)}`,
          withAdminKey(adminKey, {
            method: "PUT",
            body: JSON.stringify(draft)
          })
        )
      );
    },

    async delete(adminKey: string, id: string) {
      return ScheduleEntrySchema.parse(
        await apiJson(
          `/api/schedule/${encodeURIComponent(id)}`,
          withAdminKey(adminKey, {
            method: "DELETE"
          })
        )
      );
    }
  },

  audit: {
    async list(adminKey: string) {
      return AuditRunListSchema.parse(await apiJson("/api/audit", withAdminKey(adminKey)));
    },

    async create(adminKey: string, draft: AuditRunDraftInput) {
      return AuditRunSchema.parse(
        await apiJson(
          "/api/audit",
          withAdminKey(adminKey, {
            method: "POST",
            body: JSON.stringify(draft)
          })
        )
      );
    },

    async delete(adminKey: string, id: string) {
      return AuditRunSchema.parse(
        await apiJson(
          `/api/audit/${encodeURIComponent(id)}`,
          withAdminKey(adminKey, {
            method: "DELETE"
          })
        )
      );
    }
  },

  calendar: {
    async list(adminKey: string) {
      return CalendarEntryListSchema.parse(await apiJson("/api/calendar", withAdminKey(adminKey)));
    },

    async create(adminKey: string, draft: CalendarEntryDraftInput) {
      return CalendarEntrySchema.parse(
        await apiJson(
          "/api/calendar",
          withAdminKey(adminKey, {
            method: "POST",
            body: JSON.stringify(draft)
          })
        )
      );
    },

    async update(adminKey: string, id: string, draft: CalendarEntryDraftInput) {
      return CalendarEntrySchema.parse(
        await apiJson(
          `/api/calendar/${encodeURIComponent(id)}`,
          withAdminKey(adminKey, {
            method: "PUT",
            body: JSON.stringify(draft)
          })
        )
      );
    },

    async delete(adminKey: string, id: string) {
      return CalendarEntrySchema.parse(
        await apiJson(
          `/api/calendar/${encodeURIComponent(id)}`,
          withAdminKey(adminKey, {
            method: "DELETE"
          })
        )
      );
    },

    async autoFill(adminKey: string, input: CalendarAutoFillInput) {
      return CalendarAutoFillResultSchema.parse(
        await apiJson(
          "/api/calendar/auto-fill",
          withAdminKey(adminKey, {
            method: "POST",
            body: JSON.stringify(input)
          })
        )
      );
    },

    async getChecklist(adminKey: string, entryId: string) {
      return CalendarChecklistSchema.parse(await apiJson(`/api/calendar/${encodeURIComponent(entryId)}/checklist`, withAdminKey(adminKey)));
    },

    async updateChecklist(adminKey: string, entryId: string, update: CalendarChecklistUpdateInput) {
      return CalendarChecklistSchema.parse(
        await apiJson(
          `/api/calendar/${encodeURIComponent(entryId)}/checklist`,
          withAdminKey(adminKey, {
            method: "PUT",
            body: JSON.stringify(update)
          })
        )
      );
    }
  },

  checklistItems: {
    async list(adminKey: string) {
      return ChecklistItemListSchema.parse(await apiJson("/api/checklist-items", withAdminKey(adminKey)));
    },

    async create(adminKey: string, draft: ChecklistItemDraftInput) {
      return ChecklistItemSchema.parse(
        await apiJson(
          "/api/checklist-items",
          withAdminKey(adminKey, {
            method: "POST",
            body: JSON.stringify(draft)
          })
        )
      );
    },

    async update(adminKey: string, id: string, update: ChecklistItemUpdateInput) {
      return ChecklistItemSchema.parse(
        await apiJson(
          `/api/checklist-items/${encodeURIComponent(id)}`,
          withAdminKey(adminKey, {
            method: "PUT",
            body: JSON.stringify(update)
          })
        )
      );
    },

    async delete(adminKey: string, id: string) {
      return ChecklistItemSchema.parse(
        await apiJson(
          `/api/checklist-items/${encodeURIComponent(id)}`,
          withAdminKey(adminKey, {
            method: "DELETE"
          })
        )
      );
    }
  },

  weeklyRhythm: {
    async get(adminKey: string) {
      return WeeklyRhythmStateSchema.parse(await apiJson("/api/weekly-rhythm", withAdminKey(adminKey)));
    },

    async update(adminKey: string, update: WeeklyRhythmUpdateInput) {
      return WeeklyRhythmStateSchema.parse(
        await apiJson(
          "/api/weekly-rhythm",
          withAdminKey(adminKey, {
            method: "PUT",
            body: JSON.stringify(update)
          })
        )
      );
    },

    async reset(adminKey: string, weekStartDate: string) {
      return WeeklyRhythmStateSchema.parse(
        await apiJson(
          "/api/weekly-rhythm/reset",
          withAdminKey(adminKey, {
            method: "POST",
            body: JSON.stringify({ weekStartDate })
          })
        )
      );
    }
  },

  youtube: {
    async latest() {
      return (await apiJson("/api/youtube/latest")) as YouTubeVideo[];
    },

    async popular() {
      return (await apiJson("/api/youtube/popular")) as YouTubeVideo[];
    }
  },

  buildRequests: {
    async list(adminKey: string) {
      return BuildRequestListSchema.parse(await apiJson("/api/build-requests", withAdminKey(adminKey)));
    },

    async submit(draft: BuildRequestDraftInput & { company?: string }) {
      return BuildRequestSchema.parse(
        await apiJson("/api/build-requests", {
          method: "POST",
          body: JSON.stringify(draft)
        })
      );
    },

    async uploadImage(file: File) {
      const form = new FormData();
      form.append("file", file);

      return UploadSchema.parse(
        await apiJson("/api/build-requests/upload", {
          method: "POST",
          body: form
        })
      );
    },

    async updateStatus(adminKey: string, id: string, status: BuildRequestStatus) {
      return BuildRequestSchema.parse(
        await apiJson(
          `/api/build-requests/${encodeURIComponent(id)}`,
          withAdminKey(adminKey, {
            method: "PATCH",
            body: JSON.stringify({ status })
          })
        )
      );
    },

    async delete(adminKey: string, id: string) {
      return BuildRequestSchema.parse(
        await apiJson(
          `/api/build-requests/${encodeURIComponent(id)}`,
          withAdminKey(adminKey, {
            method: "DELETE"
          })
        )
      );
    }
  },

  uploads: {
    async list(adminKey: string) {
      return UploadListSchema.parse(await apiJson("/api/uploads", withAdminKey(adminKey)));
    },

    async create(adminKey: string, file: File) {
      const form = new FormData();
      form.append("file", await downscaleImageIfNeeded(file));

      return UploadSchema.parse(
        await apiJson(
          "/api/uploads",
          withAdminKey(adminKey, {
            method: "POST",
            body: form
          })
        )
      );
    },

    async replace(adminKey: string, uploadId: string, file: File) {
      const form = new FormData();
      form.append("file", await downscaleImageIfNeeded(file));

      return UploadSchema.parse(
        await apiJson(
          `/api/uploads/${encodeURIComponent(uploadId)}/replace`,
          withAdminKey(adminKey, {
            method: "POST",
            body: form
          })
        )
      );
    },

    async delete(adminKey: string, uploadId: string) {
      return UploadSchema.parse(
        await apiJson(
          `/api/uploads/${encodeURIComponent(uploadId)}`,
          withAdminKey(adminKey, {
            method: "DELETE"
          })
        )
      );
    }
  }
};
