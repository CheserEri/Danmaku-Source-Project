package com.movie.user.dto;

import com.movie.user.entity.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private String nickname;
    private String avatar;
    private String role;
    private String roleLabel;
    private Boolean isActive;
    private String bio;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setNickname(user.getNickname());
        response.setAvatar(user.getAvatar());
        response.setRole(user.getRole().name());
        response.setRoleLabel(user.getRole().getLabel());
        response.setIsActive(user.getIsActive());
        response.setBio(user.getBio());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}