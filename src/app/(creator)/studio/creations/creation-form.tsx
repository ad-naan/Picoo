import { CREATION_TYPES, type CreationType } from "@/modules/creation/domain/creation";

const TYPE_LABEL: Record<CreationType, string> = {
  agent: "Agent", workflow: "工作流", prompt: "Prompt", tool: "工具", article: "文章",
};

export interface CreationFormValues {
  id?: string;
  type?: CreationType;
  title?: string;
  description?: string;
  content?: string;
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
  return <form className="dashboard-form" action={action}>
    {values.id && <input type="hidden" name="id" value={values.id} />}
    <label>作品类型
      <select name="type" defaultValue={values.type ?? "agent"} required>
        {CREATION_TYPES.map((type) => <option key={type} value={type}>{TYPE_LABEL[type]}</option>)}
      </select>
    </label>
    <label>标题
      <input name="title" minLength={4} maxLength={120} required defaultValue={values.title ?? ""} placeholder="给你的 Creation 起一个清晰的标题" />
    </label>
    <label>简介
      <textarea name="description" minLength={10} maxLength={400} required defaultValue={values.description ?? ""} placeholder="一句话说明它能做什么、适合谁用" />
    </label>
    <label>详细内容
      <textarea name="content" maxLength={20000} defaultValue={values.content ?? ""} placeholder="使用说明、Prompt 正文、工作流步骤或文章内容（支持纯文本）" />
    </label>
    <label>封面图片链接
      <input name="coverUrl" type="url" maxLength={500} defaultValue={values.coverUrl ?? ""} placeholder="https://... （可选）" />
    </label>
    <label>标签
      <input name="tags" maxLength={400} defaultValue={values.tags?.join(", ") ?? ""} placeholder="用逗号或换行分隔，例如：自动化, 内容创作" />
    </label>
    <label>兼容模型
      <input name="compatibleModels" maxLength={400} defaultValue={values.compatibleModels?.join(", ") ?? ""} placeholder="例如：Claude Opus 4.8, GPT-5" />
    </label>
    <button>{submitLabel}</button>
  </form>;
}
