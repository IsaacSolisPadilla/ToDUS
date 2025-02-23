package com.todus.User;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor //Constructor vacio
public class ChangePasswordDTO {
    private String oldPassword;
    private String newPassword;
    private String confirmNewPassword;
}
