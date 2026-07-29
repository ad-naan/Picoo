"use client";

import { CREATION_TYPES, type CreationType } from "@/modules/creation/domain/creation";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/config";
import { localeMetadata, type MessageKey } from "@/i18n/catalog";
import { useLocale } from "@/i18n/locale-provider";

const TYPE_LABEL: Record<CreationType, MessageKey> = {
  agent: "creation.type.agent", workflow: "creation.type.workflow", prompt: "creation.type.prompt", tool: "creation.type.tool", article: "creation.type.article",
};

export interface CreationFormValues {
  id?: string;
  type?: CreationType;
  title?: string;
  description?: string;
  content?: string;
  sourceLocale?: Locale;
  coverUrl?: string;
  tags?: readonly string[];
  compatibleModels?: readonly string[];
}

// 共享的作品表单，供新建与编辑复用。提交动作由父页面通过 Server Action 传入。
export function CreationForm({ action, values = {}, submitLabel }: {
  action: (formData: FormData) => void;
  values?: CreationFormValues;
  submitLabel: string;
}) {
  const { t } = useLocale();
  return <form className="dashboard-form" action={action}>
    {values.id && <input type="hidden" name="id" value={values.id} />}
    <label>{t("creation.form.type")}
      <select name="type" defaultValue={values.type ?? "agent"} required>
        {CREATION_TYPES.map((type) => <option key={type} value={type}>{t(TYPE_LABEL[type])}</option>)}
      </select>
    </label>
    <label>{t("creation.form.sourceLocale")}<select name="sourceLocale" defaultValue={values.sourceLocale ?? "zh-CN"}>{SUPPORTED_LOCALES.map((locale) => <option key={locale} value={locale}>{localeMetadata[locale].label}</option>)}</select></label>
    <label>{t("creation.form.title")}
      <input name="title" minLength={4} maxLength={120} required defaultValue={values.title ?? ""} placeholder="给你的 Creation 起一个清晰的标题" />
    </label>
    <label>{t("creation.form.description")}
      <textarea name="description" minLength={10} maxLength={400} required defaultValue={values.description ?? ""} placeholder="一句话说明它能做什么、适合谁用" />
    </label>
    <label>{t("creation.form.content")}
      <textarea name="content" maxLength={20000} defaultValue={values.content ?? ""} placeholder="使用说明、Prompt 正文、工作流步骤或文章内容（支持纯文本）" />
    </label>
    <label>{t("creation.form.cover")}
      <input name="coverUrl" type="url" maxLength={500} defaultValue={values.coverUrl ?? ""} placeholder="https://... （可选）" />
    </label>
    <label>{t("creation.form.tags")}
      <input name="tags" maxLength={400} defaultValue={values.tags?.join(", ") ?? ""} placeholder="用逗号或换行分隔，例如：自动化, 内容创作" />
    </label>
    <label>{t("creation.form.models")}
      <input name="compatibleModels" maxLength={400} defaultValue={values.compatibleModels?.join(", ") ?? ""} placeholder="例如：Claude Opus 4.8, GPT-5" />
    </label>
    <button>{submitLabel}</button>
  </form>;
}
