package com.fintrack.repository;

import com.fintrack.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserId(Long userId);
    List<Budget> findByUserIdAndEndDateGreaterThanEqual(Long userId, LocalDate date);
    Optional<Budget> findByIdAndUserId(Long id, Long userId);
}
