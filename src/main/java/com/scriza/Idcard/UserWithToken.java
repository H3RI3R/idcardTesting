package com.scriza.Idcard;

import com.scriza.Idcard.Entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserWithToken {
    private User user;
    private int tokenAmount;
}