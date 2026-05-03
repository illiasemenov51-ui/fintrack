package com.fintrack.dto;

import com.fintrack.model.Transaction;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

// ==================== AUTH DTOs ====================

@Data @NoArgsConstructor @AllArgsConstructor @Builder
class RegisterRequest {
    @NotBlank @Size(min = 3, max = 50)
    public String username;
    @NotBlank @Email
    public String email;
    @NotBlank @Size(min = 6)
    public String password;
    public String fullName;
    public String currency = "USD";
}

@Data @NoArgsConstructor @AllArgsConstructor @Builder
class LoginRequest {
    @NotBlank
    public String email;
    @NotBlank
    public String password;
}

@Data @NoArgsConstructor @AllArgsConstructor @Builder
class AuthResponse {
    public String token;
    public String type = "Bearer";
    public UserDTO user;
}

// ==================== USER DTOs ====================

@Data @NoArgsConstructor @AllArgsConstructor @Builder
class UserDTO {
    public Long id;
    public UUID uuid;
    public String username;
    public String email;
    public String fullName;
    public String currency;
    public LocalDateTime createdAt;
}

// ==================== TRANSACTION DTOs ====================

@Data @NoArgsConstructor @AllArgsConstructor @Builder
class TransactionRequest {
    @NotNull @Positive
    public BigDecimal amount;
    @NotNull
    public Transaction.TransactionType type;
    public String description;
    public String note;
    public LocalDateTime transactionDate;
    public Long accountId;
    public Long categoryId;
    public Long toAccountId;
}

@Data @NoArgsConstructor @AllArgsConstructor @Builder
class TransactionDTO {
    public Long id;
    public UUID uuid;
    public BigDecimal amount;
    public Transaction.TransactionType type;
    public String description;
    public String note;
    public LocalDateTime transactionDate;
    public Long accountId;
    public String accountName;
    public Long categoryId;
    public String categoryName;
    public String categoryColor;
    public String categoryIcon;
    public LocalDateTime createdAt;
}

// ==================== ACCOUNT DTOs ====================

@Data @NoArgsConstructor @AllArgsConstructor @Builder
class AccountRequest {
    @NotBlank
    public String name;
    @NotNull
    public com.fintrack.model.Account.AccountType type;
    public BigDecimal balance = BigDecimal.ZERO;
    public String currency = "USD";
    public String color;
}

@Data @NoArgsConstructor @AllArgsConstructor @Builder
class AccountDTO {
    public Long id;
    public UUID uuid;
    public String name;
    public com.fintrack.model.Account.AccountType type;
    public BigDecimal balance;
    public String currency;
    public String color;
    public LocalDateTime createdAt;
}

// ==================== ANALYTICS DTOs ====================

@Data @NoArgsConstructor @AllArgsConstructor @Builder
class DashboardSummaryDTO {
    public BigDecimal totalBalance;
    public BigDecimal totalIncome;
    public BigDecimal totalExpenses;
    public BigDecimal netSavings;
    public List<TransactionDTO> recentTransactions;
    public List<Map<String, Object>> expensesByCategory;
    public List<Map<String, Object>> monthlyTrends;
}

@Data @NoArgsConstructor @AllArgsConstructor @Builder
class BudgetRequest {
    @NotBlank
    public String name;
    @NotNull @Positive
    public BigDecimal amount;
    @NotNull
    public com.fintrack.model.Budget.BudgetPeriod period;
    @NotNull
    public java.time.LocalDate startDate;
    @NotNull
    public java.time.LocalDate endDate;
    public Long categoryId;
}

@Data @NoArgsConstructor @AllArgsConstructor @Builder
class BudgetDTO {
    public Long id;
    public String name;
    public BigDecimal amount;
    public BigDecimal spent;
    public double percentUsed;
    public com.fintrack.model.Budget.BudgetPeriod period;
    public java.time.LocalDate startDate;
    public java.time.LocalDate endDate;
    public Long categoryId;
    public String categoryName;
}

// Public wrapper so all DTOs are accessible from package
public class Dtos {
    public static Class<RegisterRequest> registerRequest = RegisterRequest.class;
    public static Class<LoginRequest> loginRequest = LoginRequest.class;

    // static factory methods for easy construction
    public static RegisterRequest newRegisterRequest() { return new RegisterRequest(); }
    public static LoginRequest newLoginRequest() { return new LoginRequest(); }
    public static AuthResponse newAuthResponse() { return new AuthResponse(); }
    public static UserDTO newUserDTO() { return new UserDTO(); }
    public static TransactionRequest newTransactionRequest() { return new TransactionRequest(); }
    public static TransactionDTO newTransactionDTO() { return new TransactionDTO(); }
    public static AccountRequest newAccountRequest() { return new AccountRequest(); }
    public static AccountDTO newAccountDTO() { return new AccountDTO(); }
    public static DashboardSummaryDTO newDashboardSummaryDTO() { return new DashboardSummaryDTO(); }
    public static BudgetRequest newBudgetRequest() { return new BudgetRequest(); }
    public static BudgetDTO newBudgetDTO() { return new BudgetDTO(); }
}
