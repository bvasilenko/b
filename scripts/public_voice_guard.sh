#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"
TARGETS=(
  "README.md"
  "package.json"
  "src"
  "skills"
  "agents-md"
  "cursor-rules"
)

bad_words=(
  "p""ill"
  "p""ills"
  "Q5""L R-[0-9]+"
  "projects/b""-suite"
  "hold""ing/"
  "frame""works/"
  "B:""[0-9]+"
  "I[0-9]+-I[0-9]+"
  "GOV-"
  "DECISION [0-9]+"
  "implementation""-open gate"
  "0.1.0""-skeleton"
  "PENDING""-OPENEVOLVE-RUN"
  "L2""a"
  "L2""b"
  "L2""c"
  "Co-Authored""-By"
)

joined="$(IFS='|'; echo "${bad_words[*]}")"
long_dash=$'\u2014'
PATTERN="(^|[^[:alnum:]_])(${joined})([^[:alnum:]_]|$)|${long_dash}"

existing_targets=()
for target in "${TARGETS[@]}"; do
  if [ -e "${ROOT}/${target}" ]; then
    existing_targets+=("${ROOT}/${target}")
  fi
done

if [ "${#existing_targets[@]}" -eq 0 ]; then
  echo "no public files found"
  exit 0
fi

if grep -RInE "${PATTERN}" "${existing_targets[@]}"; then
  echo "public voice guard failed"
  exit 1
fi

echo "public voice guard passed"
