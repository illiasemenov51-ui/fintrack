package com.fintrack.service;

import com.fintrack.model.*;
import com.fintrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional
    public Map<String, Object> createTransaction(Long userId, BigDecimal amount,
            Transaction.TransactionType type, String description, String note,
            LocalDateTime transactionDate, Long accountId, Long categoryId, Long toAccountId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Account account = accountId != null ?
                accountRepository.findById(accountId).orElse(null) : null;
        Category category = categoryId != null ?
                categoryRepository.findById(categoryId).orElse(null) : null;
        Account toAccount = toAccountId != null ?
                accountRepository.findById(toAccountId).orElse(null) : null;

        Transaction tx = Transaction.builder()
                .amount(amount)
                .type(type)
                .description(description)
                .note(note)
                .transactionDate(transactionDate != null ? transactionDate : LocalDateTime.now())
                .user(user)
                .account(account)
                .category(category)
                .toAccount(toAccount)
                .build();

        tx = transactionRepository.save(tx);

        // Update account balance
        if (account != null) {
            if (type == Transaction.TransactionType.INCOME) {
                account.setBalance(account.getBalance().add(amount));
            } else if (type == Transaction.TransactionType.EXPENSE) {
                account.setBalance(account.getBalance().subtract(amount));
            } else if (type == Transaction.TransactionType.TRANSFER && toAccount != null) {
                account.setBalance(account.getBalance().subtract(amount));
                toAccount.setBalance(toAccount.getBalance().add(amount));
                accountRepository.save(toAccount);
            }
            accountRepository.save(account);
        }

        return toMap(tx);
    }

    @Transactional
    public Map<String, Object> updateTransaction(Long id, Long userId, BigDecimal amount,
            Transaction.TransactionType type, String description, String note,
            LocalDateTime transactionDate, Long accountId, Long categoryId) {

        Transaction tx = transactionRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        // Reverse old balance change
        if (tx.getAccount() != null) {
            Account oldAccount = tx.getAccount();
            if (tx.getType() == Transaction.TransactionType.INCOME) {
                oldAccount.setBalance(oldAccount.getBalance().subtract(tx.getAmount()));
            } else if (tx.getType() == Transaction.TransactionType.EXPENSE) {
                oldAccount.setBalance(oldAccount.getBalance().add(tx.getAmount()));
            }
            accountRepository.save(oldAccount);
        }

        // Apply new values
        tx.setAmount(amount);
        tx.setType(type);
        tx.setDescription(description);
        tx.setNote(note);
        if (transactionDate != null) tx.setTransactionDate(transactionDate);

        if (accountId != null) {
            Account newAccount = accountRepository.findById(accountId).orElse(null);
            tx.setAccount(newAccount);
            if (newAccount != null) {
                if (type == Transaction.TransactionType.INCOME) {
                    newAccount.setBalance(newAccount.getBalance().add(amount));
                } else if (type == Transaction.TransactionType.EXPENSE) {
                    newAccount.setBalance(newAccount.getBalance().subtract(amount));
                }
                accountRepository.save(newAccount);
            }
        }

        if (categoryId != null) {
            tx.setCategory(categoryRepository.findById(categoryId).orElse(null));
        }

        return toMap(transactionRepository.save(tx));
    }

    @Transactional
    public void deleteTransaction(Long id, Long userId) {
        Transaction tx = transactionRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        // Reverse balance
        if (tx.getAccount() != null) {
            Account account = tx.getAccount();
            if (tx.getType() == Transaction.TransactionType.INCOME) {
                account.setBalance(account.getBalance().subtract(tx.getAmount()));
            } else if (tx.getType() == Transaction.TransactionType.EXPENSE) {
                account.setBalance(account.getBalance().add(tx.getAmount()));
            }
            accountRepository.save(account);
        }

        transactionRepository.delete(tx);
    }

    public Map<String, Object> getTransactions(Long userId, int page, int size,
            Transaction.TransactionType type, Long categoryId, Long accountId,
            LocalDateTime startDate, LocalDateTime endDate) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending());
        Page<Transaction> txPage = transactionRepository.findByFilters(
                userId, type, categoryId, accountId, startDate, endDate, pageable);

        return Map.of(
                "content", txPage.getContent().stream().map(this::toMap).toList(),
                "totalElements", txPage.getTotalElements(),
                "totalPages", txPage.getTotalPages(),
                "currentPage", page,
                "size", size
        );
    }

    public Map<String, Object> getDashboardSummary(Long userId) {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfMonth = LocalDateTime.now();
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);

        BigDecimal totalBalance = accountRepository.sumBalanceByUserId(userId);
        BigDecimal monthlyIncome = transactionRepository.sumIncomeByPeriod(userId, startOfMonth, endOfMonth);
        BigDecimal monthlyExpense = transactionRepository.sumExpenseByPeriod(userId, startOfMonth, endOfMonth);

        List<Object[]> expensesByCat = transactionRepository.expensesByCategory(userId, startOfMonth, endOfMonth);
        List<Map<String, Object>> catData = expensesByCat.stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("category", row[0] != null ? row[0] : "Uncategorized");
            m.put("amount", row[1]);
            return m;
        }).toList();

        List<Object[]> trends = transactionRepository.monthlyTrends(userId, sixMonthsAgo);
        List<Map<String, Object>> trendData = trends.stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("month", row[0] != null ? row[0].toString() : "");
            m.put("type", row[1]);
            m.put("amount", row[2]);
            return m;
        }).toList();

        List<Map<String, Object>> recentTx = transactionRepository
                .findTop5ByUserIdOrderByTransactionDateDesc(userId)
                .stream().map(this::toMap).toList();

        return Map.of(
                "totalBalance", totalBalance != null ? totalBalance : BigDecimal.ZERO,
                "monthlyIncome", monthlyIncome != null ? monthlyIncome : BigDecimal.ZERO,
                "monthlyExpenses", monthlyExpense != null ? monthlyExpense : BigDecimal.ZERO,
                "netSavings", (monthlyIncome != null ? monthlyIncome : BigDecimal.ZERO)
                        .subtract(monthlyExpense != null ? monthlyExpense : BigDecimal.ZERO),
                "recentTransactions", recentTx,
                "expensesByCategory", catData,
                "monthlyTrends", trendData
        );
    }

    private Map<String, Object> toMap(Transaction tx) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", tx.getId());
        m.put("uuid", tx.getUuid());
        m.put("amount", tx.getAmount());
        m.put("type", tx.getType());
        m.put("description", tx.getDescription() != null ? tx.getDescription() : "");
        m.put("note", tx.getNote() != null ? tx.getNote() : "");
        m.put("transactionDate", tx.getTransactionDate());
        m.put("createdAt", tx.getCreatedAt());
        if (tx.getAccount() != null) {
            m.put("accountId", tx.getAccount().getId());
            m.put("accountName", tx.getAccount().getName());
        }
        if (tx.getCategory() != null) {
            m.put("categoryId", tx.getCategory().getId());
            m.put("categoryName", tx.getCategory().getName());
            m.put("categoryColor", tx.getCategory().getColor());
            m.put("categoryIcon", tx.getCategory().getIcon());
        }
        return m;
    }
}
