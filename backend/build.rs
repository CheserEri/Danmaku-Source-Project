use std::io::Result;

fn main() -> Result<()> {
    prost_build::compile_protos(&["proto/bilibili.dm.proto"], &["proto/"])?;
    Ok(())
}