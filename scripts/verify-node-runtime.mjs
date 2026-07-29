const [major] = process.versions.node.split(".").map(Number);

if (major !== 24) {
  console.error(
    [
      `Node.js 24.x가 필요합니다. 현재 런타임: ${process.version}`,
      "Codex에서는 workspace dependencies가 제공하는 Node.js 24 실행 파일을 사용하세요.",
      "로컬 셸에서는 .nvmrc 또는 .node-version을 기준으로 Node.js 24를 선택하세요.",
    ].join("\n"),
  );
  process.exit(1);
}

console.log(`NODE_RUNTIME_OK ${process.version}`);
