# Mard 221 色卡

将已确认来源的 Mard 221 色卡填入 `data/mard-221.json`。字段为：

- `code`：Mard 官方色号，唯一。
- `name`：Mard 官方色名。
- `hex`：用于界面展示和算法约束的色值。
- `sortOrder`：色卡的展示顺序。

色卡提交前执行仓库根目录的 `npm run check:palette`。不要添加未经确认的色号或色值。
