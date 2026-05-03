package com.fintrack.service;

import com.fintrack.model.Account;
import com.fintrack.model.User;
import com.fintrack.repository.AccountRepository;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public List<Map<String, Object>> getAccounts(Long userId) {
        return accountRepository.findByUserIdAndActiveTrue(userId)
                .stream().map(this::toMap).toList();
    }

    @Transactional
    public Map<String, Object> createAccount(Long userId, String name, Account.AccountType type,
                                              BigDecimal balance, String currency, String color) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Account account = Account.builder()
                .name(name)
                .type(type)
                .balance(balance != null ? balance : BigDecimal.ZERO)
                .currency(currency != null ? currency : "USD")
                .color(color)
                .user(user)
                .build();

        return toMap(accountRepository.save(account));
    }

    @Transactional
    public Map<String, Object> updateAccount(Long id, Long userId, String name,
                                              String color, String currency) {
        Account account = accountRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        if (name != null) account.setName(name);
        if (color != null) account.setColor(color);
        if (currency != null) account.setCurrency(currency);

        return toMap(accountRepository.save(account));
    }

    @Transactional
    public void deleteAccount(Long id, Long userId) {
        Account account = accountRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        account.setActive(false);
        accountRepository.save(account);
    }

    private Map<String, Object> toMap(Account account) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", account.getId());
        m.put("uuid", account.getUuid());
        m.put("name", account.getName());
        m.put("type", account.getType());
        m.put("balance", account.getBalance());
        m.put("currency", account.getCurrency());
        m.put("color", account.getColor() != null ? account.getColor() : "#6366F1");
        m.put("createdAt", account.getCreatedAt());
        return m;
    }
}
