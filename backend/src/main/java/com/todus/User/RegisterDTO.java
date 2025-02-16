package com.todus.User;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor //Constructor vacio
public class RegisterDTO {
    private String name;
    private String surname;
    private String nickname; 
    private String email; 
    private String password; 
    private Long imageId;
    
}
