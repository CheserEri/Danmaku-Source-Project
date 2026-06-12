use std::fmt;

/// Result type alias for danmaku operations
pub type DanmakuResult<T> = Result<T, DanmakuError>;

/// Unified error type for danmaku operations
#[derive(Debug)]
pub enum DanmakuError {
    /// HTTP request error
    Http {
        message: String,
        status: Option<u16>,
        url: String,
    },
    /// XML parse error
    XmlParse { message: String },
    /// Protobuf decode error
    ProtobufDecode { message: String },
    /// Invalid input error
    InvalidInput { message: String },
    /// Response parse error
    ResponseParse { message: String, url: String },
}

impl fmt::Display for DanmakuError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DanmakuError::Http {
                message,
                status,
                url,
            } => {
                write!(
                    f,
                    "HTTP error: {} (status: {:?}, url: {})",
                    message, status, url
                )
            }
            DanmakuError::XmlParse { message } => {
                write!(f, "XML parse error: {}", message)
            }
            DanmakuError::ProtobufDecode { message } => {
                write!(f, "Protobuf decode error: {}", message)
            }
            DanmakuError::InvalidInput { message } => {
                write!(f, "Invalid input: {}", message)
            }
            DanmakuError::ResponseParse { message, url } => {
                write!(f, "Response parse error: {} (url: {})", message, url)
            }
        }
    }
}

impl std::error::Error for DanmakuError {}

impl From<reqwest::Error> for DanmakuError {
    fn from(err: reqwest::Error) -> Self {
        DanmakuError::Http {
            message: err.to_string(),
            status: err.status().map(|s| s.as_u16()),
            url: err.url().map(|u| u.to_string()).unwrap_or_default(),
        }
    }
}

impl From<anyhow::Error> for DanmakuError {
    fn from(err: anyhow::Error) -> Self {
        DanmakuError::ResponseParse {
            message: err.to_string(),
            url: String::new(),
        }
    }
}

/// Helper to create success result
pub fn ok<T>(value: T) -> DanmakuResult<T> {
    Ok(value)
}

/// Helper to create error result
pub fn err<T>(error: DanmakuError) -> DanmakuResult<T> {
    Err(error)
}
