# Mard 标准色卡与套装

将已确认来源的 Mard 221 色母色卡填入 `data/mard-221.json`。字段为：

- `code`：Mard 官方色号，唯一。
- `name`：Mard 官方色名。
- `hex`：用于界面展示和算法约束的色值。
- `sortOrder`：色卡的展示顺序。

将 24、48、72、96、120、221 色套装对应的**实际色号集合**填入 `data/mard-standard-kits.json`；默认项固定为 `mard-221`。套装不只保存颜色数量，必须保存每一个可用色号。

色卡提交前执行仓库根目录的 `npm run check:palette`。不要添加未经确认的色号或色值。
