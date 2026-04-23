package llm

import "strings"

// Shared JSON extractor
func extractJSON(s string) string {
	start := strings.Index(s, "{")
	end := strings.LastIndex(s, "}")
	if start == -1 || end == -1 || end <= start {
		return "{}"
	}
	return s[start : end+1]
}