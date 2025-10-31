package repoerror

import (
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

var (
	ErrNotFound           = errors.New("resource not found")
	ErrDuplicate          = errors.New("resource already exists")
	ErrConstraintViolated = errors.New("constraint violation")
)

// PGErrorDetail - это наша собственная, урезанная структура
// для представления ключевой информации из ошибки Postgres.
type PGErrorDetail struct {
	Message    string `json:"message"`
	Code       string `json:"code"`
	Constraint string `json:"constraint,omitempty"`
	Detail     string `json:"detail,omitempty"`
	Table      string `json:"table,omitempty"`
}

// Метод Error() позволяет нашей структуре быть полноценной ошибкой (удовлетворяет интерфейсу `error`).
func (e PGErrorDetail) Error() string {
	return e.Message
}

func Parse(err error) error {
	if err == nil {
		return nil
	}

	if errors.Is(err, pgx.ErrNoRows) {
		return ErrNotFound
	}

	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		detailErr := &PGErrorDetail{
			Message:    pgErr.Message,
			Code:       pgErr.Code,
			Constraint: pgErr.ConstraintName,
			Detail:     pgErr.Detail,
			Table:      pgErr.TableName,
		}

		switch detailErr.Code {
		case "23505":
			return fmt.Errorf("%w: %w", ErrDuplicate, detailErr)
		case "23514":
			return fmt.Errorf("%w: %w", ErrConstraintViolated, detailErr)
		}

		return detailErr
	}
	return err
}
