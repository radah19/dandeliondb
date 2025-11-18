package com.dandeliondb.backend.service;

import at.favre.lib.crypto.bcrypt.BCrypt;
import com.dandeliondb.backend.model.User;
import com.dandeliondb.backend.repository.AuthRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private AuthRepository authRepo;

    @Autowired
    public void setAuthRepo(AuthRepository authRepo) {
        this.authRepo = authRepo;
    }

    public boolean verifyPassword(String password, String hashed) {
        BCrypt.Result result = BCrypt.verifyer().verify(password.toCharArray(), hashed);

        return result.verified;
    }

    public User getUserByEmail(String email) {
        return authRepo.getUserByEmail(email);
    }

    public boolean addUser(String email, String password) {
        return authRepo.addUser(email, password);
    }

    public void addWaitlistEmail(String email) {
        authRepo.addWaitlistEmail(email);
    }
}
