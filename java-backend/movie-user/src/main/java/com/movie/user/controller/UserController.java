package com.movie.user.controller;

import com.movie.common.result.Result;
import com.movie.user.dto.UserResponse;
import com.movie.user.entity.User;
import com.movie.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "用户接口")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "获取当前用户信息")
    @GetMapping("/me")
    public Result<UserResponse> getCurrentUser(@RequestAttribute Long userId) {
        try {
            UserResponse user = userService.getUserById(userId);
            return Result.success(user);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "更新当前用户信息")
    @PutMapping("/me")
    public Result<UserResponse> updateCurrentUser(
            @RequestAttribute Long userId,
            @RequestBody User updateData) {
        try {
            UserResponse user = userService.updateUser(userId, updateData);
            return Result.success(user);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "获取用户列表（管理员）")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return Result.success(users);
    }

    @Operation(summary = "获取指定用户信息")
    @GetMapping("/{id}")
    public Result<UserResponse> getUserById(@PathVariable Long id) {
        try {
            UserResponse user = userService.getUserById(id);
            return Result.success(user);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "修改用户角色（管理员）")
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<UserResponse> updateUserRole(
            @PathVariable Long id,
            @RequestParam String role) {
        try {
            UserResponse user = userService.updateUserRole(id, role);
            return Result.success(user);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @Operation(summary = "启用/禁用用户（管理员）")
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<UserResponse> toggleUserStatus(@PathVariable Long id) {
        try {
            UserResponse user = userService.toggleUserStatus(id);
            return Result.success(user);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
}