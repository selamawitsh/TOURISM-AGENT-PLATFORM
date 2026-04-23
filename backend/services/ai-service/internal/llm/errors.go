package llm

import "fmt"

func ErrAllProvidersFailed(method string) error {
	return fmt.Errorf("all providers failed for %s", method)
}