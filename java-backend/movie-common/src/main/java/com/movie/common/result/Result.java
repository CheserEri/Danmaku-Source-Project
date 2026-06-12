package com.movie.common.result;

import lombok.Data;

import java.io.Serializable;

/**
 * 统一返回结果封装类
 * 
 * 所有 API 接口都使用此类封装返回结果，确保返回格式一致。
 * 
 * @param <T> 业务数据类型
 * 
 * 使用示例:
 * <pre>
 * // 成功返回（无数据）
 * return Result.success();
 * 
 * // 成功返回（有数据）
 * return Result.success(user);
 * 
 * // 失败返回
 * return Result.error("用户不存在");
 * 
 * // 失败返回（自定义状态码）
 * return Result.error(404, "用户不存在");
 * </pre>
 * 
 * 返回格式:
 * {
 *   "code": 200,           // 状态码，200 表示成功
 *   "message": "success",  // 状态描述
 *   "data": {}             // 业务数据，可为 null
 * }
 */
@Data
public class Result<T> implements Serializable {

    /**
     * 状态码
     * - 200: 成功
     * - 400: 请求参数错误
     * - 401: 未认证
     * - 403: 无权限
     * - 404: 资源不存在
     * - 500: 服务器内部错误
     */
    private int code;

    /**
     * 状态描述
     * - 成功时为 "success"
     * - 失败时为具体错误信息
     */
    private String message;

    /**
     * 业务数据
     * - 成功时返回业务数据
     * - 失败时为 null
     */
    private T data;

    /**
     * 成功返回（无数据）
     * 
     * @return 成功结果，code=200, message="success", data=null
     */
    public static <T> Result<T> success() {
        return success(null);
    }

    /**
     * 成功返回（有数据）
     * 
     * @param data 业务数据
     * @return 成功结果，code=200, message="success", data=传入的数据
     */
    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage("success");
        result.setData(data);
        return result;
    }

    /**
     * 失败返回（默认状态码 500）
     * 
     * @param message 错误信息
     * @return 失败结果，code=500, message=错误信息, data=null
     */
    public static <T> Result<T> error(String message) {
        return error(500, message);
    }

    /**
     * 失败返回（自定义状态码）
     * 
     * @param code 状态码
     * @param message 错误信息
     * @return 失败结果，code=传入的状态码, message=错误信息, data=null
     */
    public static <T> Result<T> error(int code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }
}
