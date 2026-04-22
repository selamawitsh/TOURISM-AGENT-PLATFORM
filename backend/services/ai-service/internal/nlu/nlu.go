package nlu

import "backend/services/ai-service/internal/llm"

type Parser struct{
    client llm.Client
}

func NewParser(c llm.Client) *Parser { return &Parser{client: c} }

func (p *Parser) ParseText(text string) (map[string]interface{}, error) {
    return p.client.Parse(text)
}
